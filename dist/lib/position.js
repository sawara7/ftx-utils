"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FTXPositionClass = void 0;
const trade_utils_1 = require("trade-utils");
class FTXPositionClass extends trade_utils_1.BasePositionClass {
    constructor(params) {
        super(params);
        this._api = params.api;
    }
    placeOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._backtestMode) {
                return {
                    success: 1,
                    result: {
                        id: Date.now(),
                        createdAt: Date.now().toString(),
                        filledSize: 0.0,
                        future: this.openOrder.market.name,
                        market: this.openOrder.market.name,
                        price: order.price,
                        remainingSize: 0,
                        side: order.side,
                        size: order.size,
                        status: 'open',
                        type: order.type,
                        reduceOnly: order.OrderRequest.reduceOnly || false,
                        ioc: order.OrderRequest.ioc || false,
                        postOnly: order.OrderRequest.postOnly || false,
                        clientId: order.OrderRequest.clientId || 'test'
                    }
                };
            }
            return yield this._api.placeOrder(order.OrderRequest);
        });
    }
    doOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.placeOrder(this.openOrder);
            if (res.success === 0) {
                throw new Error('[Place Order Error]' + res.result);
            }
            return res.result.id.toString();
        });
    }
    doClose() {
        return __awaiter(this, void 0, void 0, function* () {
            const s = this.state.isLosscut ? "losscut" : "close";
            const res = yield this.placeOrder((s === "close" || !this.losscutOrder) ? this.closeOrder : this.losscutOrder);
            if (res.success === 0) {
                throw new Error('[Place Order Error]' + res.result);
            }
            return res.result.id.toString();
        });
    }
    doCancel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.orderID) {
                yield this._api.cancelOrder(parseInt(this.state.orderID));
            }
        });
    }
    get openOrder() {
        return super.openOrder;
    }
    get closeOrder() {
        return super.closeOrder;
    }
    get losscutOrder() {
        return super.losscutOrder;
    }
}
exports.FTXPositionClass = FTXPositionClass;
