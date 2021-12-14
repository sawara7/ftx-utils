import { PlaceOrderRequest, PrivateApiClass, wsFill, wsOrder } from "..";
import { Response, PlaceOrderResponce } from "..";

export class SinglePosition {
    private targetSize: number = 0;
    public currentSize: number = 0;
    private openID: number = 0;
    private closeID: number = 0;
    private openTime: number = 0;
    private closeTime: number = 0;
    public isLosscut: boolean = false;
    public openSide: 'buy' | 'sell' = 'buy';
    public onOpened?: () => void;
    public onClosed?: () => void;
    public onOpenOrderCanceled?: () => void;
    public onCloseOrderCanceled?: () => void;
    public openPrice: number = 0;
    public closePrice: number = 0;
    private cumulativeFee: number = 0;
    private cumulativeProfit: number = 0;
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
        price?: number,
        postOnly?: boolean
    ): Promise<Response<PlaceOrderResponce>> {
        const p: PlaceOrderRequest = {
            market: this.marketName,
            side: side,
            price: price ? price : null,
            type: type,
            size: size,
            reduceOnly: false,
            ioc: false
        }
        if (postOnly) {
            p.postOnly = true
        }
        return await this.api.placeOrder(p);
    }

    public async openMarket(side: 'buy' | 'sell', price: number) {
        if (this.openID > 0) {
            throw Error('Position is already opened.')
        }
        this.openSide = side
        this.openID = 1 // lock
        try {
            const res = await this.placeOrder(side, 'market', this.funds/price)
            this.openID = res.result.id
            this.openTime = Date.now()
        } catch(e) {
            console.log(e)
            this.openID = 0
        }
    }

    public async openLimit(side: 'buy' | 'sell', price: number, postOnly: boolean = true, cancelSec: number = 0) {
        if (this.openID > 0) {
            throw Error('Position is already opened.')
        }
        this.openID = 1 // lock
        try {
            const res = await this.placeOrder(side, 'limit', this.funds/price, price, postOnly)
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
        } catch(e) {
            this.openID = 0
        }
    }

    public async closeMarket() {
        if (this.closeID > 0) {
            throw Error('Position is already closed.')
        }
        this.closeID = 1 // lock
        try {
            const res = await this.placeOrder(
                this.openSide === 'buy'? 'sell': 'buy',
                'market',
                this.currentSize)
            this.closeID = res.result.id
            this.closeTime = Date.now()
        } catch(e) {
            this.closeID = 0
        }
    }

    public async closeLimit(price: number, postOnly: boolean = true, cancelSec: number = 0) {
        if (this.closeID > 0) {
            throw Error('Position is already closed.')
        }
        this.closeID = 1
        try {
            const res = await this.placeOrder(
                this.openSide === 'buy'? 'sell': 'buy',
                'limit',
                this.currentSize,
                price,
                postOnly)
            this.closeID = res.result.id
            this.closeTime = Date.now()
            if (cancelSec > 0) {
                setInterval(()=>{
                    if (this.closeID !== 0) {
                        this.api.cancelAllOrder({
                            market: this.marketName
                        })
                    }
                }, cancelSec * 1000)
            }
        } catch(e) {
            this.closeID = 0
        }
    }

    public updateOrder(order: wsOrder) {
        if (order.id === this.openID && order.status === 'closed') {
            this.openID = 0
            if (order.filledSize > 0) {
                this.currentSize += order.filledSize
                this.targetSize += order.filledSize
                this.openPrice = order.avgFillPrice? order.avgFillPrice: order.price   
            }
            if (order.filledSize !== order.size) {
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled()
                }
            }
            if (order.filledSize === order.size) {
                if (this.onOpened){
                    this.onOpened()
                }
            }
        }
        if (order.id === this.closeID && order.status === 'closed') {
            this.closeID = 0
            if (order.filledSize > 0) {
                this.currentSize -= order.filledSize
                this.closePrice = order.avgFillPrice? order.avgFillPrice: order.price
            }
            if (order.filledSize !== order.size) {
                if (this.onCloseOrderCanceled){
                    this.onCloseOrderCanceled()
                }
            }

            if (this.isLosscut && this.currentSize > 0) {
                this.closeMarket()
            } else if (this.isLosscut && this.currentSize === 0){
                this.isLosscut = false
            }

            if (order.filledSize === order.size) {
                this.isLosscut = false
                this.cumulativeProfit += this.targetSize * 
                    (this.openSide === 'buy' ?
                        (this.closePrice - this.openPrice):
                        (this.openPrice - this.closePrice)
                    )
                this.targetSize = 0
                this.currentSize = 0
                if (this.onClosed){
                    this.onClosed()
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
        if (this.closeID > 0){
            this.api.cancelAllOrder({
                market: this.marketName
            })
        }
    }

    public cancel() {
        if (this.closeID > 0 || this.openID > 0){
            this.api.cancelAllOrder({
                market: this.marketName
            })
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