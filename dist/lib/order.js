"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FTXOrderClass = void 0;
const trade_utils_1 = require("trade-utils");
class FTXOrderClass extends trade_utils_1.BaseOrderClass {
    constructor(params) {
        super(params);
        this._reduceOnly = params.reduceOnly || false;
        this._ioc = params.ioc || false;
    }
    get OrderRequest() {
        return {
            market: this.market.name,
            side: this.side,
            price: this.type === 'limit' ? this.price : null,
            type: this.type,
            size: this.size,
            reduceOnly: this._reduceOnly,
            ioc: this._ioc,
            postOnly: this.postOnly,
            // clientId: this._clientID
        };
    }
}
exports.FTXOrderClass = FTXOrderClass;
