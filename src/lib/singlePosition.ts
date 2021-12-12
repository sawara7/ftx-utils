import { PrivateApiClass, wsFill, wsOrder } from "..";
import { Response, PlaceOrderResponce } from "..";

export class SinglePosition {
    private positionSize: number = 0;
    private openID: number = 0;
    private closeID: number = 0;
    private openTime: number = 0;
    private closeTime: number = 0;
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
        const res = await this.placeOrder(this.openSide, 'market', this.funds/price)
        this.openID = res.result.id
        this.openTime = Date.now()
    }

    public async openLimit(price: number) {
        const res = await this.placeOrder(this.openSide, 'limit', this.funds/price, price)
        this.openID = res.result.id
        this.openTime = Date.now()
    }

    public async closeMarket() {
        const res = await this.placeOrder(
            this.openSide === 'buy'? 'sell': 'buy',
            'market',
            this.positionSize)
        this.closeID = res.result.id
        this.closeTime = Date.now()
    }

    public async closeLimit(price: number) {
        const res = await this.placeOrder(
            this.openSide === 'buy'? 'sell': 'buy',
            'limit',
            this.positionSize,
            price)
        this.closeID = res.result.id
        this.closeTime = Date.now()
    }

    public updateOrder(order: wsOrder) {
        if (order.id === this.openID) {
            if (order.remainingSize > 0 &&
                order.status === 'complete'
            ){
                this.openID = 0
            }
        }
        if (order.id === this.closeID) {
            if (order.remainingSize > 0 &&
                order.status === 'complete'
            ){
                this.closeID = 0
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
        }
        if (this.closeID === fill.orderId) {
            this.positionSize -= fill.size
            this.closeID = 0
        }
    }
}