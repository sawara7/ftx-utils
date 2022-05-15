import {
    sleep
} from "my-utils"

import {
    BasePositionClass,
    BasePositionParameters,
    MarketInfo,
    OrderSide,
    OrderType
} from "trade-utils"

import {
    FTXResponse,
    PlaceOrderResponce,
    PrivateApiClass,
    wsOrder,
    wsTicker
} from ".."

import {
    FTXOrderClass
} from "./order"

export interface FTXSinglePositionParameters extends BasePositionParameters {
    marketInfo: MarketInfo
    openSide: OrderSide
    orderType: OrderType
    funds: number
    api: PrivateApiClass
    openPrice: number
    closePrice: number
    losscutPrice?: number
    minOrderInterval?: number
}

export class FTXSinglePosition extends BasePositionClass {
    // Global State
    private static _lastOrderTime?: {[marketName: string]: number}

    // Parameters
    private _api: PrivateApiClass
    private _minOrderInterval: number

    // Position State
    private _marketInfo: MarketInfo
    private _initialSize: number = 0
    private _currentSize: number = 0
    private _openPrice: number = 0
    private _closePrice: number = 0
    private _openOrder: FTXOrderClass
    private _closeOrder: FTXOrderClass
    private _losscutOrder?: FTXOrderClass
    private _losscutPrice?: number

    private _openID: string = ''
    private _closeID: string = ''

    constructor(params: FTXSinglePositionParameters){
        super(params)
        this._api = params.api
        this._marketInfo = params.marketInfo
        this._minOrderInterval = params.minOrderInterval || 200
        const size = params.funds/params.openPrice
        this._openOrder = new FTXOrderClass({
            market: params.marketInfo,
            type: params.orderType,
            side: params.openSide,
            size: size,
            price: params.openPrice
        })
        this._closeOrder = new FTXOrderClass({
            market: params.marketInfo,
            type: params.orderType,
            side: params.openSide === 'buy'? 'sell': 'buy',
            size: size,
            price: params.closePrice
        })
        this._initialSize = this._openOrder.size
        this._losscutPrice = params.losscutPrice
        FTXSinglePosition.initializeLastOrderTime(this._marketInfo.name)
    }

    private static initializeLastOrderTime(market: string) {
        if (!FTXSinglePosition._lastOrderTime){
            FTXSinglePosition._lastOrderTime = {}
        }
        if (!FTXSinglePosition._lastOrderTime[market]){
            FTXSinglePosition._lastOrderTime[market] = Date.now()
        }
    }

    private async sleepWhileOrderInterval(): Promise<void> {
        if (!FTXSinglePosition._lastOrderTime) {
            throw new Error('no last order')
        }
        if (FTXSinglePosition._lastOrderTime[this._marketInfo.name]) {
            const interval = Date.now() - FTXSinglePosition._lastOrderTime[this._marketInfo.name]
            if (interval > 0) {
                if (interval < this._minOrderInterval) {
                    FTXSinglePosition._lastOrderTime[this._marketInfo.name] += this._minOrderInterval 
                    await sleep(this._minOrderInterval - interval)
                } else if (interval > this._minOrderInterval) {
                    FTXSinglePosition._lastOrderTime[this._marketInfo.name] = Date.now()
                }
            } else if (interval < 0) {
                FTXSinglePosition._lastOrderTime[this._marketInfo.name] += this._minOrderInterval
                await sleep(FTXSinglePosition._lastOrderTime[this._marketInfo.name] - Date.now())
            }
        }
    }

    private async placeOrder(order: FTXOrderClass): Promise<FTXResponse<PlaceOrderResponce>> {
        await this.sleepWhileOrderInterval()
        if (this._backtestMode) {
            return {
                success: 1,
                result: {
                    id: Date.now(),
                    createdAt: Date.now().toString(),
                    filledSize:	0.0,	
                    future:	this._marketInfo.name,
                    market:	this._marketInfo.name,
                    price: order.price,
                    remainingSize: 0,	
                    side: order.side,	
                    size: order.size,	
                    status:	'open',
                    type: order.type,	
                    reduceOnly: order.limitOrderRequest.reduceOnly || false,
                    ioc: order.limitOrderRequest.ioc || false,	
                    postOnly: order.limitOrderRequest.postOnly || false,	
                    clientId: order.limitOrderRequest.clientId || 'test'
                }
            }
        }
        return await this._api.placeOrder(order.limitOrderRequest)
    }

    public async doOpen(): Promise<void> {
        if (parseInt(this._openID) > 0) {
            throw new Error('Position is already opened.')
        }
        const res = await this.placeOrder(this._openOrder)
        if (res.success === 0) {
            throw new Error('Place Order Error')
        }
        this._openID = res.result.id.toString()
    }
    
    public async doClose(): Promise<void> {
        if (parseInt(this._closeID) > 0) {
            throw new Error('Position is already opened.')
        }
        const res = await this.placeOrder(this._closeOrder)
        if (res.success === 0) {
            throw new Error('Place Order Error')
        }
        this._closeID = res.result.id.toString()
    }

    public async doLosscut(): Promise<void> {
        if (this._losscut && this._closeID) {
            this._api.cancelOrder(parseInt(this._closeID))
        }
    }

    public updateTicker(ticker: wsTicker) {
        // ToDO: 含み損更新
    }

    public updateOrder(order: wsOrder) {
        const size = this.openOrder.roundSize(order.size)
        const filled = this.openOrder.roundSize(order.filledSize)
        if (order.id.toString() === this._openID && order.status === 'closed') {
            this._openID = ''
            if (filled > 0) {
                this._currentSize = filled
                this._initialSize = filled
                this._openPrice = this.openOrder.roundPrice(order.avgFillPrice? order.avgFillPrice: order.price)   
            }
            if (filled !== size) {
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled(this)
                }
            }
            if (filled === size) {
                if (this.onOpened){
                    this.onOpened(this)
                }
            }
        }
        if (order.id.toString() === this._closeID && order.status === 'closed') {
            this._closeID = ''
            if (filled > 0) {
                this._currentSize = this.closeOrder.roundSize(this._currentSize - filled)
                this._closePrice = this.closeOrder.roundPrice(order.avgFillPrice? order.avgFillPrice: order.price)
            }
            if (filled !== size) {
                if (this._losscut) {
                    this._losscutOrder = new FTXOrderClass({
                        market: this.closeOrder.market,
                        type: this.closeOrder.type,
                        side: this.closeOrder.side,
                        size: this._currentSize,
                        price: this._losscutPrice
                    })
                    this.placeOrder(this._losscutOrder)
                }
                if (this.onCloseOrderCanceled){
                    this.onCloseOrderCanceled(this)
                }
            }

            if (filled === size) {
                if (this._losscut) {
                    this._losscutCount++
                    this._losscut = false
                    if (this.onLosscut){
                        this.onLosscut(this)
                    }
                }
                this._cumulativeProfit += this._initialSize * 
                    (this.openOrder.side === 'buy' ? (this._closePrice - this._openPrice): (this._openPrice - this._closePrice))
                this._initialSize = 0
                this._currentSize = 0
                this._unrealizedProfit = 0
                this._closeCount++
                if (this.onClosed){
                    this.onClosed(this)
                }
            }
        }
    }
    
    get activeID(): string {
        if (this._openID !== ''){
            return this._openID
        }
        if (this._closeID !== ''){
            return this._closeID
        }
        return ''
    }

    get enabledOpen(): boolean {
        return super.enabledOpen &&
            this.activeID === '' &&
            this._currentSize === 0
    }

    get enabledClose(): boolean {
        return super.enabledOpen &&
            this.activeID === '' &&
            this._currentSize > 0
    }

    get openOrder(): FTXOrderClass {
        return this._openOrder
    }

    get closeOrder(): FTXOrderClass {
        return this._closeOrder
    }

    get losscutOrder(): FTXOrderClass | undefined{
        return this._losscutOrder
    }

    get isLosscut(): boolean {
        return this._losscut
    }

    get losscutPrice(): number | undefined {
        return this._losscutPrice
    }

    get currentOpenPrice(): number {
        return this._openPrice
    }

    get currentClosePrice(): number {
        return this._closePrice
    }

    get currentSize(): number {
        return this._currentSize
    }

    set bestAsk(value: number) {
        super.bestAsk = value
        if (this._currentSize > 0 && this._openOrder.side === 'sell') {
            this._unrealizedProfit = (this._openPrice - value) * this._currentSize
        }
    }

    set bestBid(value: number) {
        super.bestBid = value
        if (this._currentSize > 0 && this._openOrder.side === 'buy') {
            this._unrealizedProfit = (value - this._openPrice) * this._currentSize
        }
    }
}