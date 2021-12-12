import { PrivateApiClass, wsFill, wsOrder } from "..";
import { Response, PlaceOrderResponce } from "..";

export class SinglePosition {
    private positionSize: number = 0;
    private openID: number = 0;
    private closeID: number = 0;
    private openTime: number = 0;
    private closeTime: number = 0;
    private openSide: 'buy' | 'sell' = 'buy';
    public onOpened?: () => void;
    public onClosed?: () => void;
    public onOpenOrderCanceled?: () => void;
    public onCloseOrderCanceled?: () => void;
    public openPrice: number = 0;
    public openFee: number = 0;
    public closePrice: number = 0;
    public closeFee: number = 0;
    public lastProfit: number = 0;
    public cumulativeProfit: number = 0;
    constructor(
        private marketName: string,
        private funds: number,
        private api: PrivateApiClass
    ){

    }

    private async placeOrder(
        side: 'buy' | 'sell',
        type: 'limit' | 'market',
        size: number,
        price?: number
    ): Promise<Response<PlaceOrderResponce>> {
        return await this.api.placeOrder({
            market: this.marketName,
            side: side,
            price: price ? price : null,
            type: type,
            size: size,
            reduceOnly: false,
            ioc: false
        });
    }

    public async openMarket(side: 'buy' | 'sell', price: number) {
        if (this.openID > 0) {
            throw Error('Position is already opened.')
        }
        this.openSide = side
        const res = await this.placeOrder(side, 'market', this.funds/price)
        this.openID = res.result.id
        this.openTime = Date.now()
    }

    public async openLimit(side: 'buy' | 'sell', price: number, cancelSec: number = 0) {
        if (this.openID > 0) {
            throw Error('Position is already opened.')
        }
        const res = await this.placeOrder(side, 'limit', this.funds/price, price)
        this.openSide = side
        this.openID = res.result.id
        this.openTime = Date.now()
        if (cancelSec > 0) {
            setInterval(()=>{
                if (this.openID !== 0) {
                    this.api.cancelAllOrder({
                        market: this.marketName
                    })
                }
            }, cancelSec * 1000)
        }
    }

    public async closeMarket() {
        if (this.closeID > 0) {
            throw Error('Position is already closed.')
        }
        const res = await this.placeOrder(
            this.openSide === 'buy'? 'sell': 'buy',
            'market',
            this.positionSize)
        this.closeID = res.result.id
        this.closeTime = Date.now()
    }

    public async closeLimit(price: number, cancelSec: number = 0) {
        if (this.closeID > 0) {
            throw Error('Position is already closed.')
        }
        const res = await this.placeOrder(
            this.openSide === 'buy'? 'sell': 'buy',
            'limit',
            this.positionSize,
            price)
        this.closeID = res.result.id
        this.closeTime = Date.now()
        if (cancelSec > 0) {
            setInterval(()=>{
                if (this.openID !== 0) {
                    this.api.cancelAllOrder({
                        market: this.marketName
                    })
                }
            }, cancelSec * 1000)
        }
    }

    public updateOrder(order: wsOrder) {
        if (order.id === this.openID) {
            if (
                order.filledSize !== order.size &&
                order.status === 'closed'
            ){
                this.openID = 0
                this.positionSize += order.filledSize
                if (this.onOpenOrderCanceled){
                    this.onOpenOrderCanceled()
                }
            }
        }
        if (order.id === this.closeID) {
            if (
                order.filledSize !== order.size &&
                order.status === 'closed'
            ){
                this.closeID = 0
                this.positionSize -= order.filledSize
                if (this.onCloseOrderCanceled){
                    this.onCloseOrderCanceled()
                }
            }
        }
    }

    public updateFill(fill: wsFill) {
        if (this.openID === 0 && this.closeID === 0) {
            return
        }
        if (this.openID === fill.orderId) {
            this.positionSize += fill.size
            this.openPrice = fill.price
            this.openFee = fill.fee
            this.openID = 0
            if (this.onOpened){
                this.onOpened()
            }
        }
        if (this.closeID === fill.orderId) {
            this.positionSize -= fill.size
            this.closePrice = fill.price
            this.closeFee = fill.fee
            this.lastProfit = - (this.openFee + this.closeFee) +
                this.openSide === 'buy'?
                    (this.closePrice - this.openPrice) * fill.size:
                    (this.openPrice - this.closePrice) * fill.size
            this.cumulativeProfit += this.lastProfit
            this.closeID = 0
            if (this.onClosed){
                this.onClosed()
            }
        }
    }

    get enabledOpen(): Boolean {
        return  this.openID === 0 &&
                this.closeID === 0 &&
                this.positionSize === 0
    }

    get enabledClose(): Boolean {
        return  this.openID !== 0 &&
                this.closeID === 0 &&
                this.positionSize > 0
    }
}