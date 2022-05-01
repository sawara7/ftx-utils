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
const my_utils_1 = require("my-utils");
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
        this._minOrderInterval = params.minOrderInterval || 200;
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
        FTXSinglePosition.initializeLastOrderTime(this._marketInfo.name);
    }
    static initializeLastOrderTime(market) {
        if (!FTXSinglePosition._lastOrderTime) {
            FTXSinglePosition._lastOrderTime = {};
        }
        if (!FTXSinglePosition._lastOrderTime[market]) {
            FTXSinglePosition._lastOrderTime[market] = Date.now();
        }
    }
    sleepWhileOrderInterval() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FTXSinglePosition._lastOrderTime) {
                throw new Error('no last order');
            }
            if (FTXSinglePosition._lastOrderTime[this._marketInfo.name]) {
                const interval = Date.now() - FTXSinglePosition._lastOrderTime[this._marketInfo.name];
                if (interval > 0) {
                    if (interval < this._minOrderInterval) {
                        FTXSinglePosition._lastOrderTime[this._marketInfo.name] += this._minOrderInterval;
                        yield (0, my_utils_1.sleep)(this._minOrderInterval - interval);
                    }
                    else if (interval > this._minOrderInterval) {
                        FTXSinglePosition._lastOrderTime[this._marketInfo.name] = Date.now();
                    }
                }
                else if (interval < 0) {
                    FTXSinglePosition._lastOrderTime[this._marketInfo.name] += this._minOrderInterval;
                    yield (0, my_utils_1.sleep)(FTXSinglePosition._lastOrderTime[this._marketInfo.name] - Date.now());
                }
            }
        });
    }
    placeOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sleepWhileOrderInterval();
            return yield this._api.placeOrder(order.limitOrderRequest);
        });
    }
    doOpen() {
        const _super = Object.create(null, {
            doOpen: { get: () => super.doOpen }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.doOpen.call(this);
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
        const _super = Object.create(null, {
            doClose: { get: () => super.doClose }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.doClose.call(this);
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
    updateTicker(ticker) {
        // ToDO: 含み損更新
    }
    updateOrder(order) {
        const size = order.size;
        const filled = order.filledSize;
        if (order.id.toString() === this._openID && order.status === 'closed') {
            this._openID = '';
            if (filled > 0) {
                this._currentSize = this.openOrder.roundSize(filled);
                this._initialSize = this.openOrder.roundSize(filled);
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
                if (this.onCloseOrderCanceled) {
                    this.onCloseOrderCanceled(this);
                }
            }
            // if (this._isLosscut && this._currentSize > 0) {
            //     this.closeMarket()
            // }
            if (filled === size) {
                // if (this._isLosscut) {
                //     this._losscutCount++
                //     this._isLosscut = false
                // }
                this._cumulativeProfit += this._initialSize *
                    (this.openOrder.side === 'buy' ? (this._closePrice - this._openPrice) : (this._openPrice - this._closePrice));
                this._initialSize = 0;
                this._currentSize = 0;
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
    get openOrder() {
        return this._openOrder;
    }
    get closeOrder() {
        return this._closeOrder;
    }
    get currentOpenPrice() {
        return this._openPrice;
    }
    get currentClosePrice() {
        return this._closePrice;
    }
}
exports.FTXSinglePosition = FTXSinglePosition;
