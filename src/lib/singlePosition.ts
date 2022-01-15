import {
    OrderSide,
    OrderType,
    sleep
} from "my-utils"

import {
    Response,
    PlaceOrderRequest,
    PlaceOrderResponce,
    PrivateApiClass,
    wsFill,
    wsOrder,
    wsTicker
} from ".."
export interface SinglePositionParameters {
    marketName: string
    funds: number
    api: PrivateApiClass
    sizeResolution: number
    priceResolution: number
    minOrderInterval?: number
    openOrderSettings?: OrderSettings
    closeOrderSettings?: OrderSettings
}

export interface SinglePositionResponse {
    success: boolean
    message?: any 
}
export interface OrderSettings {
    side: OrderSide
    type: OrderType
    price: number
    size?: number
    postOnly?: boolean
    cancelSec?: number
}
export class SinglePosition {
    // Global State
    private static _lastOrderTime?: {[marketName: string]: number}

    // Parameters
    private _api: PrivateApiClass
    private _marketName: string
    private _funds: number 
    private _minOrderInterval: number
    private _openOrderSettings?: OrderSettings
    private _closeOrderSettings?: OrderSettings

    // Position State
    private _initialSize: number = 0
    private _currentSize: number = 0
    private _openID: number = 0
    private _closeID: number = 0
    private _openTime: number = 0
    private _closeTime: number = 0
    private _isLosscut: boolean = false;
    private _openSide: OrderSide = 'buy'
    private _currentOpenPrice: number = 0
    private _currentClosePrice: number = 0
    private _sizeResolution: number
    private _priceResolution: number

    // Information
    private _closeCount: number = 0
    private _losscutCount: number = 0
    private _cumulativeFee: number = 0
    private _cumulativeProfit: number = 0

    // Events
    public onOpened?: (pos: SinglePosition) => void
    public onClosed?: (pos: SinglePosition) => void
    public onOpenOrderCanceled?: (pos: SinglePosition) => void
    public onCloseOrderCanceled?: (pos: SinglePosition) => void

    constructor(params: SinglePositionParameters){
        if (!SinglePosition._lastOrderTime){
            SinglePosition._lastOrderTime = {}
        }
        this._marketName = params.marketName
        if (!SinglePosition._lastOrderTime[this._marketName]){
            SinglePosition._lastOrderTime[this._marketName] = Date.now()
        }
        this._funds = params.funds
        this._api = params.api
        this._minOrderInterval = params.minOrderInterval || 200
        this._openOrderSettings = params.openOrderSettings
        this._closeOrderSettings = params.closeOrderSettings
        this._sizeResolution = params.sizeResolution
        this._priceResolution = params.priceResolution
    }

    private roundSize(size: number): number {
        return Math.round(size * (1/this._sizeResolution))/(1/this._sizeResolution)
    }

    private roundPrice(price: number): number {
        return Math.round(price * (1/this._priceResolution))/(1/this._priceResolution)
    }

    private async placeOrder(side: OrderSide, type: OrderType, size: number,
        price?: number, postOnly?: boolean): Promise<Response<PlaceOrderResponce>> {
        const p: PlaceOrderRequest = {
            market: this._marketName,
            side: side,
            price: price ? this.roundPrice(price) : null,
            type: type,
            size: this.roundSize(size),
            reduceOnly: false,
            ioc: false
        }
        if (postOnly) {
            p.postOnly = true
        }
        if (SinglePosition._lastOrderTime && SinglePosition._lastOrderTime[this._marketName]) {
            const interval = Date.now() - SinglePosition._lastOrderTime[this._marketName]
            if (interval > 0) {
                if (interval < this._minOrderInterval) {
                    SinglePosition._lastOrderTime[this._marketName] += this._minOrderInterval 
                    await sleep(this._minOrderInterval - interval)
                } else if (interval > this._minOrderInterval) {
                    SinglePosition._lastOrderTime[this._marketName] = Date.now()
                }
            } else if (interval < 0) {
                SinglePosition._lastOrderTime[this._marketName] += this._minOrderInterval
                await sleep(SinglePosition._lastOrderTime[this._marketName] - Date.now())
            }
        }
        const res = await this._api.placeOrder(p);
        if (res.success) {
            return res
        } else {
            throw new Error('failed')
        }
    }

    private setOpen(res: PlaceOrderResponce) {
        this._openSide = res.side === 'buy'? 'buy': 'sell'
        this._openID = res.id
        this._openTime = Date.now()
    }

    private setClose(res: PlaceOrderResponce) {
        this._closeID = res.id
        this._closeTime = Date.now()
    }

    private resetOpen() {
        this._openID = 0
    }

    private resetClose() {
        this._closeID = 0
    }

    public async open(): Promise<SinglePositionResponse> {
        if (!this._openOrderSettings) {
            return {success: false, message:'No open order settings.'}
        }
        if (this._openOrderSettings.type === 'limit') {
            return await this.openLimit(
                this._openOrderSettings.side,
                this._openOrderSettings.price,
                this._openOrderSettings.postOnly,
                this._openOrderSettings.cancelSec || 0
                )
        } else if (this._openOrderSettings.type === 'market')  {
            return await this.openMarket(
                this._openOrderSettings.side,
                this._openOrderSettings.price
                )
        }
        return {success: false, message:'Open Failed.'}
    }

    public async close(): Promise<SinglePositionResponse> {
        if (!this._closeOrderSettings) {
            return {success: false, message:'No close order settings.'}
        }
        if (this._closeOrderSettings.type === 'limit') {
            return await this.closeLimit(
                this._closeOrderSettings.price,
                this._closeOrderSettings.postOnly,
                this._closeOrderSettings.cancelSec || 0
                )
        } else if (this._closeOrderSettings.type === 'market')  {
            return await this.closeMarket()
        }
        return {success: false, message:'Close Failed.'}
    }

    public async openMarket(side: OrderSide, price: number): Promise<SinglePositionResponse> {
        if (this._openID > 0) {
            return {success: false, message:'Position is already opened.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this._openID = 1 // lock
        try {
            const res = await this.placeOrder(side, 'market', this._funds/price)
            this.setOpen(res.result)
            result.success = true
        } catch(e) {
            result.message = e
            this._openID = 0
        }
        return result
    }

    public async openLimit(side: 'buy' | 'sell', price: number, postOnly: boolean = true, cancelSec: number = 0): Promise<SinglePositionResponse> {
        if (this._openID > 0) {
            return {success: false, message:'Position is already opened.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this._openID = 1 // lock
        try {
            const res = await this.placeOrder(side, 'limit', this._funds/price, price, postOnly)
            this.setOpen(res.result)
            result.success = true
            if (cancelSec > 0) {
                setTimeout(()=>{
                    if (this._openID !== 0) {
                        this._api.cancelOrder(this._openID)
                    }
                }, cancelSec * 1000)
            }
        } catch(e) {
            result.message = e
            this._openID = 0
        }
        return result
    }

    public async closeMarket(): Promise<SinglePositionResponse> {
        if (this._closeID > 0) {
            return {success: false, message:'Position is already closed.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this._closeID = 1 // lock
        try {
            const res = await this.placeOrder(
                this._openSide === 'buy'? 'sell': 'buy',
                'market',
                this._currentSize)
            this.setClose(res.result)
            result.success = true
        } catch(e) {
            result.message = e
            this._closeID = 0
        }
        return result
    }

    public async closeLimit(price: number, postOnly: boolean = true, cancelSec: number = 0): Promise<SinglePositionResponse> {
        if (this._closeID > 0) {
            return {success: false, message:'Position is already closed.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this._closeID = 1
        try {
            const res = await this.placeOrder(
                this._openSide === 'buy'? 'sell': 'buy',
                'limit',
                this._currentSize,
                price,
                postOnly)
            this.setClose(res.result)
            result.success = true
            if (cancelSec > 0) {
                setTimeout(()=>{
                    if (this._closeID !== 0) {
                        this._api.cancelOrder(this._closeID)
                    }
                }, cancelSec * 1000)
            }
        } catch(e) {
            result.message = e
            this._closeID = 0
        }
        return result
    }

    public updateTicker(ticker: wsTicker) {
        // ToDO: 含み損更新
    }

    public updateOrder(order: wsOrder) {
        if (order.id === this._openID && order.status === 'closed') {
            this.resetOpen()
            const size = this.roundSize(order.size)
            const filled = this.roundSize(order.filledSize)
            if (order.filledSize > 0) {
                this._currentSize += filled
                this._initialSize += filled
                this._currentOpenPrice = order.avgFillPrice? order.avgFillPrice: order.price   
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
        if (order.id === this._closeID && order.status === 'closed') {
            this.resetClose()
            const size = this.roundSize(order.size)
            const filled = this.roundSize(order.filledSize)
            if (filled > 0) {
                this._currentSize -= filled
                this._currentClosePrice = order.avgFillPrice? order.avgFillPrice: order.price
            }
            if (filled !== size) {
                if (this.onCloseOrderCanceled){
                    this.onCloseOrderCanceled(this)
                }
            }

            if (this._isLosscut && this._currentSize > 0) {
                this.closeMarket()
            }

            if (filled === size) {
                if (this._isLosscut) {
                    this._losscutCount++
                    this._isLosscut = false
                }
                this._cumulativeProfit += this._initialSize * 
                    (this._openSide === 'buy' ?
                        (this._currentClosePrice - this._currentOpenPrice):
                        (this._currentOpenPrice - this._currentClosePrice)
                    )
                this._initialSize = 0
                this._currentSize = 0
                this._closeCount++
                if (this.onClosed){
                    this.onClosed(this)
                }
            }
        }
    }

    public updateFill(fill: wsFill) {
        if (fill.market === this._marketName) {
            this._cumulativeFee += fill.fee
        }
    }

    public losscut() {
        this._isLosscut = true
        this.cancelCloseOrder()
    }

    public cancelAll() {
        if (this._closeID > 0 || this._openID > 0){
            this._api.cancelAllOrder({
                market: this._marketName
            })
        }
    }

    public cancelOpenOrder() {
        if (this._openID > 0){
            this._api.cancelOrder(this._openID)
        }
    }

    public cancelCloseOrder() {
        if (this._closeID > 0){
            this._api.cancelOrder(this._closeID)
        }
    }

    get profit(): number {
        return this._cumulativeProfit - this._cumulativeFee
    }

    get enabledOpen(): Boolean {
        return  this._openID === 0 &&
                this._closeID === 0 &&
                this._currentSize === 0
    }

    get enabledClose(): Boolean {
        return  this._openID === 0 &&
                this._closeID === 0 &&
                this._currentSize > 0
    }

    get openOrderSettings(): OrderSettings | undefined {
        return this._openOrderSettings
    }

    get closeOrderSettings(): OrderSettings | undefined {
        return this._closeOrderSettings
    }
    
    get currentSize(): number {
        return this._currentSize
    }

    get isLosscut(): boolean {
        return this._isLosscut
    }

    get openSide(): OrderSide {
        return this._openSide
    }

    get currentOpenPrice(): number {
        return this._currentOpenPrice
    }

    get currentClosePrice(): number {
        return this._currentClosePrice
    }

    get closeCount(): number {
        return this._closeCount
    }

    get losscutCount(): number {
        return this._losscutCount
    }
}