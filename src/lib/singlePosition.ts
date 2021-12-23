
import {
    Response,
    PlaceOrderRequest,
    PlaceOrderResponce,
    PrivateApiClass,
    wsFill,
    wsOrder,
    wsTicker
} from ".."
import { OrderSide, OrderType, sleep } from "./utils"
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
    private static lastOrderTime?: {[marketName: string]: number}

    // Parameters
    private api: PrivateApiClass
    private marketName: string
    private funds: number 
    private minOrderInterval: number
    public openOrderSettings?: OrderSettings
    public closeOrderSettings?: OrderSettings

    // Position State
    private initialSize: number = 0
    public currentSize: number = 0
    private openID: number = 0
    private closeID: number = 0
    private openTime: number = 0
    private closeTime: number = 0
    public isLosscut: boolean = false;
    public openSide: OrderSide = 'buy'
    public currentOpenPrice: number = 0
    public currentClosePrice: number = 0
    private cumulativeFee: number = 0
    private cumulativeProfit: number = 0
    private sizeResolution: number
    private priceResolution: number

    // Events
    public onOpened?: (pos: SinglePosition) => void
    public onClosed?: (pos: SinglePosition) => void
    public onOpenOrderCanceled?: (pos: SinglePosition) => void
    public onCloseOrderCanceled?: (pos: SinglePosition) => void

    constructor(params: SinglePositionParameters){
        if (!SinglePosition.lastOrderTime){
            SinglePosition.lastOrderTime = {}
        }
        this.marketName = params.marketName
        if (!SinglePosition.lastOrderTime[this.marketName]){
            SinglePosition.lastOrderTime[this.marketName] = Date.now()
        }
        this.funds = params.funds
        this.api = params.api
        this.minOrderInterval = params.minOrderInterval || 200
        this.openOrderSettings = params.openOrderSettings
        this.closeOrderSettings = params.closeOrderSettings
        this.sizeResolution = params.sizeResolution
        this.priceResolution = params.priceResolution
    }

    private roundSize(size: number): number {
        return Math.round(size * (1/this.sizeResolution))/(1/this.sizeResolution)
    }

    private roundPrice(price: number): number {
        return Math.round(price * (1/this.priceResolution))/(1/this.priceResolution)
    }

    private async placeOrder(side: OrderSide, type: OrderType, size: number,
        price?: number, postOnly?: boolean): Promise<Response<PlaceOrderResponce>> {
        const p: PlaceOrderRequest = {
            market: this.marketName,
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
        if (SinglePosition.lastOrderTime && SinglePosition.lastOrderTime[this.marketName]) {
            const interval = Date.now() - SinglePosition.lastOrderTime[this.marketName]
            if (interval > 0) {
                if (interval < this.minOrderInterval) {
                    SinglePosition.lastOrderTime[this.marketName] += this.minOrderInterval 
                    await sleep(this.minOrderInterval - interval)
                } else if (interval > this.minOrderInterval) {
                    SinglePosition.lastOrderTime[this.marketName] = Date.now()
                }
            } else if (interval < 0) {
                SinglePosition.lastOrderTime[this.marketName] += this.minOrderInterval
                await sleep(SinglePosition.lastOrderTime[this.marketName] - Date.now())
            }
        }
        const res = await this.api.placeOrder(p);
        if (res.success) {
            return res
        } else {
            throw new Error('failed')
        }
    }

    private SetOpen(res: PlaceOrderResponce) {
        this.openSide = res.side === 'buy'? 'buy': 'sell'
        this.openID = res.id
        this.openTime = Date.now()
    }

    private SetClose(res: PlaceOrderResponce) {
        this.closeID = res.id
        this.closeTime = Date.now()
    }

    public async open(): Promise<SinglePositionResponse> {
        if (!this.openOrderSettings) {
            return {success: false, message:'No open order settings.'}
        }
        if (this.openOrderSettings.type === 'limit') {
            return await this.openLimit(
                this.openOrderSettings.side,
                this.openOrderSettings.price,
                this.openOrderSettings.postOnly,
                this.openOrderSettings.cancelSec || 0
                )
        } else if (this.openOrderSettings.type === 'market')  {
            return await this.openMarket(
                this.openOrderSettings.side,
                this.openOrderSettings.price
                )
        }
        return {success: false, message:'Open Failed.'}
    }

    public async close(): Promise<SinglePositionResponse> {
        if (!this.closeOrderSettings) {
            return {success: false, message:'No close order settings.'}
        }
        if (this.closeOrderSettings.type === 'limit') {
            return await this.closeLimit(
                this.closeOrderSettings.price,
                this.closeOrderSettings.postOnly,
                this.closeOrderSettings.cancelSec || 0
                )
        } else if (this.closeOrderSettings.type === 'market')  {
            return await this.closeMarket()
        }
        return {success: false, message:'Close Failed.'}
    }

    public async openMarket(side: OrderSide, price: number): Promise<SinglePositionResponse> {
        if (this.openID > 0) {
            return {success: false, message:'Position is already opened.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this.openID = 1 // lock
        try {
            const res = await this.placeOrder(side, 'market', this.funds/price)
            this.SetOpen(res.result)
            result.success = true
        } catch(e) {
            result.message = e
            this.openID = 0
        }
        return result
    }

    public async openLimit(side: 'buy' | 'sell', price: number, postOnly: boolean = true, cancelSec: number = 0): Promise<SinglePositionResponse> {
        if (this.openID > 0) {
            return {success: false, message:'Position is already opened.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this.openID = 1 // lock
        try {
            const res = await this.placeOrder(side, 'limit', this.funds/price, price, postOnly)
            this.SetOpen(res.result)
            result.success = true
            if (cancelSec > 0) {
                setTimeout(()=>{
                    if (this.openID !== 0) {
                        this.api.cancelOrder(this.openID)
                    }
                }, cancelSec * 1000)
            }
        } catch(e) {
            result.message = e
            this.openID = 0
        }
        return result
    }

    public async closeMarket(): Promise<SinglePositionResponse> {
        if (this.closeID > 0) {
            return {success: false, message:'Position is already closed.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this.closeID = 1 // lock
        try {
            const res = await this.placeOrder(
                this.openSide === 'buy'? 'sell': 'buy',
                'market',
                this.currentSize)
            this.SetClose(res.result)
            result.success = true
        } catch(e) {
            result.message = e
            this.closeID = 0
        }
        return result
    }

    public async closeLimit(price: number, postOnly: boolean = true, cancelSec: number = 0): Promise<SinglePositionResponse> {
        if (this.closeID > 0) {
            return {success: false, message:'Position is already closed.'}
        }
        const result: SinglePositionResponse = {
            success: false
        }
        this.closeID = 1
        try {
            const res = await this.placeOrder(
                this.openSide === 'buy'? 'sell': 'buy',
                'limit',
                this.currentSize,
                price,
                postOnly)
            this.SetClose(res.result)
            result.success = true
            if (cancelSec > 0) {
                setTimeout(()=>{
                    if (this.closeID !== 0) {
                        this.api.cancelOrder(this.closeID)
                    }
                }, cancelSec * 1000)
            }
        } catch(e) {
            result.message = e
            this.closeID = 0
        }
        return result
    }

    public updateTicker(ticker: wsTicker) {
        if (this.openID > 1 &&
            this.openTime < Date.now() - 60 * 1000 &&
            this.openOrderSettings &&
            this.openOrderSettings.type === 'limit' &&
            (this.openOrderSettings.side === 'buy'?
            this.openOrderSettings.price > ticker.bid:
            this.openOrderSettings.price < ticker.ask)) {
                this.openID = 0
                this.currentSize = this.roundSize(this.funds/this.openOrderSettings.price)
                this.initialSize = this.roundSize(this.funds/this.openOrderSettings.price)
                this.currentOpenPrice = this.openOrderSettings.price
                if (this.onOpened){
                    this.onOpened(this)
                }
        }
        if (this.closeID > 1 &&
            this.closeTime < Date.now() - 60 * 1000 &&
            this.closeOrderSettings &&
            this.closeOrderSettings.type === 'limit' &&
            (this.closeOrderSettings.side === 'buy'?
            this.closeOrderSettings.price > ticker.bid:
            this.closeOrderSettings.price < ticker.ask)) {
                this.closeID = 0
                this.isLosscut = false
                this.currentClosePrice = this.closeOrderSettings.price
                this.cumulativeProfit += this.initialSize * 
                    (this.openSide === 'buy' ?
                        (this.currentClosePrice - this.currentOpenPrice):
                        (this.currentOpenPrice - this.currentClosePrice)
                    )
                this.initialSize = 0
                this.currentSize = 0
                if (this.onClosed){
                    this.onClosed(this)
                }
        }
    }

    public updateOrder(order: wsOrder) {
        if (order.id === this.openID && order.status === 'closed') {
            this.openID = 0
            const size = this.roundSize(order.size)
            const filled = this.roundSize(order.filledSize)
            if (order.filledSize > 0) {
                this.currentSize += filled
                this.initialSize += filled
                this.currentOpenPrice = order.avgFillPrice? order.avgFillPrice: order.price   
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
        if (order.id === this.closeID && order.status === 'closed') {
            this.closeID = 0
            const size = this.roundSize(order.size)
            const filled = this.roundSize(order.filledSize)
            if (filled > 0) {
                this.currentSize -= filled
                this.currentClosePrice = order.avgFillPrice? order.avgFillPrice: order.price
            }
            if (filled !== size) {
                if (this.onCloseOrderCanceled){
                    this.onCloseOrderCanceled(this)
                }
            }

            if (this.isLosscut && this.currentSize > 0) {
                this.closeMarket()
            } else if (this.isLosscut && this.currentSize === 0){
                this.isLosscut = false
            }

            if (filled === size) {
                this.isLosscut = false
                this.cumulativeProfit += this.initialSize * 
                    (this.openSide === 'buy' ?
                        (this.currentClosePrice - this.currentOpenPrice):
                        (this.currentOpenPrice - this.currentClosePrice)
                    )
                this.initialSize = 0
                this.currentSize = 0
                if (this.onClosed){
                    this.onClosed(this)
                }
            }
        }
    }

    public updateFill(fill: wsFill) {
        if (fill.market === this.marketName) {
            this.cumulativeFee += fill.fee
        }
    }

    get profit(): number {
        return this.cumulativeProfit - this.cumulativeFee
    }

    public losscut() {
        this.isLosscut = true
        this.cancelCloseOrder()
    }

    public cancelAll() {
        if (this.closeID > 0 || this.openID > 0){
            this.api.cancelAllOrder({
                market: this.marketName
            })
        }
    }

    public cancelOpenOrder() {
        if (this.openID > 0){
            this.api.cancelOrder(this.openID)
        }
    }

    public cancelCloseOrder() {
        if (this.closeID > 0){
            this.api.cancelOrder(this.closeID)
        }
    }

    get enabledOpen(): Boolean {
        return  this.openID === 0 &&
                this.closeID === 0 &&
                this.currentSize === 0
    }

    get enabledClose(): Boolean {
        return  this.openID !== 0 &&
                this.closeID === 0 &&
                this.currentSize > 0
    }
}