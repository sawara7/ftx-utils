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
exports.FTXSinglePosition = void 0;
const trade_utils_1 = require("trade-utils");
const order_1 = require("./order");
class FTXSinglePosition extends trade_utils_1.BasePositionClass {
    constructor(params) {
        super(params);
        this._initialSize = 0;
        this._currentSize = 0;
        this._openPrice = 0;
        this._closePrice = 0;
        this._openID = '';
        this._closeID = '';
        this._api = params.api;
        this._marketInfo = params.marketInfo;
        const size = params.funds / params.openPrice;
        this._openOrder = new order_1.FTXOrderClass({
            market: params.marketInfo,
            type: params.orderType,
            side: params.openSide,
            size: size,
            price: params.openPrice
        });
        this._closeOrder = new order_1.FTXOrderClass({
            market: params.marketInfo,
            type: params.orderType,
            side: params.openSide === 'buy' ? 'sell' : 'buy',
            size: size,
            price: params.closePrice
        });
        this._initialSize = this._openOrder.size;
        this._losscutPrice = params.losscutPrice;
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
                        future: this._marketInfo.name,
                        market: this._marketInfo.name,
                        price: order.price,
                        remainingSize: 0,
                        side: order.side,
                        size: order.size,
                        status: 'open',
                        type: order.type,
                        reduceOnly: order.limitOrderRequest.reduceOnly || false,
                        ioc: order.limitOrderRequest.ioc || false,
                        postOnly: order.limitOrderRequest.postOnly || false,
                        clientId: order.limitOrderRequest.clientId || 'test'
                    }
                };
            }
            return yield this._api.placeOrder(order.limitOrderRequest);
        });
    }
    doOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(this._openID) > 0) {
                throw new Error('Position is already opened.');
            }
            const res = yield this.placeOrder(this._openOrder);
            if (res.success === 0) {
                throw new Error('Place Order Error');
            }
            this._openID = res.result.id.toString();
        });
    }
    doClose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (parseInt(this._closeID) > 0) {
                throw new Error('Position is already opened.');
            }
            const res = yield this.placeOrder(this._closeOrder);
            if (res.success === 0) {
                throw new Error('Place Order Error');
            }
            this._closeID = res.result.id.toString();
        });
    }
    doLosscut() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._losscut && parseInt(this._closeID) > 0) {
                this._api.cancelOrder(parseInt(this._closeID));
            }
        });
    }
    placeLosscutOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            this._losscutOrder = new order_1.FTXOrderClass({
                market: this.closeOrder.market,
                type: this.closeOrder.type,
                side: this.closeOrder.side,
                size: this._currentSize,
                price: this.closeOrder.side === 'buy' ? this.bestBid : this.bestAsk
            });
            console.log(this._losscutOrder);
            const res = yield this.placeOrder(this._losscutOrder);
            if (res.success === 0) {
                throw new Error('Place Order Error');
            }
            this._closeID = res.result.id.toString();
        });
    }
    updateTicker(ticker) {
        this.bestAsk = ticker.ask;
        this.bestBid = ticker.bid;
        // ToDO: 含み損更新
    }
    updateOrder(order) {
        const size = this.openOrder.roundSize(order.size);
        const filled = this.openOrder.roundSize(order.filledSize);
        if (order.id.toString() === this._openID && order.status === 'closed') {
            this._openID = '';
            if (filled > 0) {
                this._currentSize = filled;
                this._initialSize = filled;
                this._openPrice = this.openOrder.roundPrice(order.avgFillPrice ? order.avgFillPrice : order.price);
            }
            if (filled !== size) {
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled(this);
                }
            }
            if (filled === size) {
                if (this.onOpened) {
                    this.onOpened(this);
                }
            }
        }
        if (order.id.toString() === this._closeID && order.status === 'closed') {
            this._closeID = '';
            if (filled > 0) {
                this._currentSize = this.closeOrder.roundSize(this._currentSize - filled);
                this._closePrice = this.closeOrder.roundPrice(order.avgFillPrice ? order.avgFillPrice : order.price);
            }
            if (filled !== size) {
                if (this._losscut) {
                    this.placeLosscutOrder();
                }
                if (this.onCloseOrderCanceled) {
                    this.onCloseOrderCanceled(this);
                }
            }
            if (filled === size) {
                if (this._losscut) {
                    this._losscutCount++;
                    this._losscut = false;
                    if (this.onLosscut) {
                        this.onLosscut(this);
                    }
                }
                this._cumulativeProfit += this._initialSize *
                    (this.openOrder.side === 'buy' ? (this._closePrice - this._openPrice) : (this._openPrice - this._closePrice));
                this._initialSize = 0;
                this._currentSize = 0;
                this._unrealizedProfit = 0;
                this._closeCount++;
                if (this.onClosed) {
                    this.onClosed(this);
                }
            }
        }
    }
    get activeID() {
        if (this._openID !== '') {
            return this._openID;
        }
        if (this._closeID !== '') {
            return this._closeID;
        }
        return '';
    }
    get enabledOpen() {
        return super.enabledOpen &&
            this.activeID === '' &&
            this._currentSize === 0;
    }
    get enabledClose() {
        return super.enabledOpen &&
            this.activeID === '' &&
            this._currentSize > 0;
    }
    get openOrder() {
        return this._openOrder;
    }
    get closeOrder() {
        return this._closeOrder;
    }
    get losscutOrder() {
        return this._losscutOrder;
    }
    get isLosscut() {
        return this._losscut;
    }
    get losscutPrice() {
        return this._losscutPrice;
    }
    get currentOpenPrice() {
        return this._openPrice;
    }
    get currentClosePrice() {
        return this._closePrice;
    }
    get currentSize() {
        return this._currentSize;
    }
    get bestAsk() {
        return super.bestAsk;
    }
    get bestBid() {
        return super.bestBid;
    }
    set bestAsk(value) {
        super.bestAsk = value;
        if (this._currentSize > 0 && this._openOrder.side === 'sell') {
            this._unrealizedProfit = (this._openPrice - value) * this._currentSize;
        }
    }
    set bestBid(value) {
        super.bestBid = value;
        if (this._currentSize > 0 && this._openOrder.side === 'buy') {
            this._unrealizedProfit = (value - this._openPrice) * this._currentSize;
        }
    }
}
exports.FTXSinglePosition = FTXSinglePosition;
