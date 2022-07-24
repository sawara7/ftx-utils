import {
    BaseOrderSettings,
    BaseOrderClass
} from "trade-utils"

import {
    PlaceOrderRequest
} from ".."

export interface FTXOrderSettings extends BaseOrderSettings {
    reduceOnly?: boolean; //	false	optional; default is false
    ioc?: boolean; //	false	optional; default is false
}

export class FTXOrderClass extends BaseOrderClass {
    private _reduceOnly: boolean
    private _ioc: boolean

    constructor (params: FTXOrderSettings) {
        super(params)
        this._reduceOnly = params.reduceOnly || false
        this._ioc = params.ioc || false
    }

    get OrderRequest(): PlaceOrderRequest {
        return {
            market:	this.market.name,
            side: this.side, 
            price: this.type === 'limit'? this.price: null,
            type: this.type,
            size: this.size,	
            reduceOnly: this._reduceOnly,
            ioc: this._ioc,
            postOnly: this.postOnly,
            // clientId: this._clientID
        }
    }

    // get request(): BaseOrderRequest {
    //     if (this.type === 'limit') {
    //         return this.limitOrderRequest
    //     }
    //     throw new Error('failed order create.')
    // }
}