import {
    sleep
} from "my-utils"

import {
    BasePositionClass,
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

export interface FTXSinglePositionParameters {
    marketInfo: MarketInfo
    openSide: OrderSide
    orderType: OrderType
    funds: number
    api: PrivateApiClass
    openPrice: number
    closePrice: number
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
        return await this._api.placeOrder(order.limitOrderRequest)
    }

    public async doOpen(): Promise<void> {
        await super.doOpen()
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
        await super.doClose()
        if (parseInt(this._closeID) > 0) {
            throw new Error('Position is already opened.')
        }
        const res = await this.placeOrder(this._closeOrder)
        if (res.success === 0) {
            throw new Error('Place Order Error')
        }
        this._closeID = res.result.id.toString()
    }

    public updateTicker(ticker: wsTicker) {
        // ToDO: 含み損更新
    }

    public updateOrder(order: wsOrder) {
        const size = order.size
        const filled = order.filledSize
        if (order.id.toString() === this._openID && order.status === 'closed') {
            this._openID = ''
            if (filled > 0) {
                this._currentSize = this.openOrder.roundSize(filled)
                this._initialSize = this.openOrder.roundSize(filled)
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
                if (this.onCloseOrderCanceled){
                    this.onCloseOrderCanceled(this)
                }
            }

            // if (this._isLosscut && this._currentSize > 0) {
            //     this.closeMarket()
            // }

            if (filled === size) {
                // if (this._isLosscut) {
                //     this._losscutCount++
                //     this._isLosscut = false
                // }
                this._cumulativeProfit += this._initialSize * 
                    (this.openOrder.side === 'buy' ? (this._closePrice - this._openPrice): (this._openPrice - this._closePrice))
                this._initialSize = 0
                this._currentSize = 0
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

    get currentOpenPrice(): number {
        return this._openPrice
    }

    get currentClosePrice(): number {
        return this._closePrice
    }
}