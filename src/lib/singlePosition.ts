import { PrivateApiClass, wsFill, wsOrder } from "..";
import { Response, PlaceOrderResponce } from "..";

export class SinglePosition {
    private positionSize: number = 0;
    private openID: number = 0;
    private closeID: number = 0;
    private openTime: number = 0;
    private closeTime: number = 0;
    public onOpened?: () => void;
    public onClosed?: () => void;
    public onOpenOrderCanceled?: () => void;
    public onCloseOrderCanceled?: () => void;
    constructor(
        private marketName: string,
        private funds: number,
        private openSide: 'buy' | 'sell',
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

    public async openMarket(price: number) {
        if (this.openID > 0) {
            throw Error('Position is already opened.')
        }
        const res = await this.placeOrder(this.openSide, 'market', this.funds/price)
        this.openID = res.result.id
        this.openTime = Date.now()
    }

    public async openLimit(price: number, cancelSec: number = 0) {
        if (this.openID > 0) {
            throw Error('Position is already opened.')
        }
        const res = await this.placeOrder(this.openSide, 'limit', this.funds/price, price)
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
            if (order.remainingSize > 0 &&
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
            if (order.remainingSize > 0 &&
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
            this.openID = 0
            if (this.onOpened){
                this.onOpened()
            }
        }
        if (this.closeID === fill.orderId) {
            this.positionSize -= fill.size
            this.closeID = 0
            if (this.onClosed){
                this.onClosed()
            }
        }
    }
}