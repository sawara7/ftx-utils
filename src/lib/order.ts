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
    private _clientID: string

    constructor (params: FTXOrderSettings) {
        super(params)
        this._reduceOnly = params.reduceOnly || false
        this._ioc = params.ioc || false
        this._clientID = params.clientID || ''
    }

    get limitOrderRequest(): PlaceOrderRequest {
        return {
            market:	this.market.name,
            side: this.side, 
            price: this.price,
            type: 'limit',
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