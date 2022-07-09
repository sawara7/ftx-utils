import {
    BasePositionClass,
    BasePositionParameters
} from "trade-utils"

import {
    FTXResponse,
    PlaceOrderResponce,
    FTXPrivateApiClass
} from ".."

import { FTXOrderClass } from "./order"

export interface FTXPositionParameters extends BasePositionParameters {
    api: FTXPrivateApiClass
}

export class FTXPositionClass extends BasePositionClass {
    // Parameters
    private _api: FTXPrivateApiClass

    constructor(params: FTXPositionParameters){
        super(params)
        this._api = params.api
    }

    private async placeOrder(order: FTXOrderClass): Promise<FTXResponse<PlaceOrderResponce>> {
        if (this._backtestMode) {
            return {
                success: 1,
                result: {
                    id: Date.now(),
                    createdAt: Date.now().toString(),
                    filledSize:	0.0,	
                    future:	this.openOrder.market.name,
                    market:	this.openOrder.market.name,
                    price: order.price,
                    remainingSize: 0,	
                    side: order.side,	
                    size: order.size,	
                    status:	'open',
                    type: order.type,	
                    reduceOnly: order.OrderRequest.reduceOnly || false,
                    ioc: order.OrderRequest.ioc || false,	
                    postOnly: order.OrderRequest.postOnly || false,	
                    clientId: order.OrderRequest.clientId || 'test'
                }
            }
        }
        return await this._api.placeOrder(order.OrderRequest)
    }

    public async doOpen() {
        const res = await this.placeOrder(this.openOrder)
        if (res.success === 0) {
            throw new Error('[Place Order Error]' + res.result)
        }
        return res.result.id.toString()
    }
    
    public async doClose() {
        const s = this.state.isLosscut? "losscut": "close"
        const res = await this.placeOrder( s === "close"? this.closeOrder: this.losscutOrder )
        if (res.success === 0) {
            throw new Error('[Place Order Error]' + res.result)
        }
        return res.result.id.toString()
    }

    public async doCancel() {
        if (this.state.orderID) {
            await this._api.cancelOrder(parseInt(this.state.orderID))
        }
    }

    get openOrder(): FTXOrderClass {
        return super.openOrder as FTXOrderClass
    }
    
    get closeOrder(): FTXOrderClass {
        return super.closeOrder as FTXOrderClass
    }

    get losscutOrder(): FTXOrderClass {
        return super.losscutOrder as FTXOrderClass
    }
}