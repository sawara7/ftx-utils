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
exports.SinglePosition = void 0;
class SinglePosition {
    constructor(marketName, funds, api) {
        this.marketName = marketName;
        this.funds = funds;
        this.api = api;
        this.targetSize = 0;
        this.currentSize = 0;
        this.openID = 0;
        this.closeID = 0;
        this.openTime = 0;
        this.closeTime = 0;
        this.isLosscut = false;
        this.openSide = 'buy';
        this.openPrice = 0;
        this.closePrice = 0;
        this.cumulativeFee = 0;
        this.cumulativeProfit = 0;
    }
    placeOrder(side, type, size, price, postOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = {
                market: this.marketName,
                side: side,
                price: price ? price : null,
                type: type,
                size: size,
                reduceOnly: false,
                ioc: false
            };
            if (postOnly) {
                p.postOnly = true;
            }
            return yield this.api.placeOrder(p);
        });
    }
    openMarket(side, price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openID > 0) {
                throw Error('Position is already opened.');
            }
            this.openSide = side;
            this.openID = 1; // lock
            try {
                const res = yield this.placeOrder(side, 'market', this.funds / price);
                this.openID = res.result.id;
                this.openTime = Date.now();
            }
            catch (e) {
                console.log(e);
                this.openID = 0;
            }
        });
    }
    openLimit(side, price, postOnly = true, cancelSec = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openID > 0) {
                throw Error('Position is already opened.');
            }
            this.openID = 1; // lock
            try {
                const res = yield this.placeOrder(side, 'limit', this.funds / price, price, postOnly);
                this.openSide = side;
                this.openID = res.result.id;
                this.openTime = Date.now();
                if (cancelSec > 0) {
                    setTimeout(() => {
                        if (this.openID !== 0) {
                            this.api.cancelAllOrder({
                                market: this.marketName
                            });
                        }
                    }, cancelSec * 1000);
                }
            }
            catch (e) {
                this.openID = 0;
            }
        });
    }
    closeMarket() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closeID > 0) {
                throw Error('Position is already closed.');
            }
            this.closeID = 1; // lock
            try {
                const res = yield this.placeOrder(this.openSide === 'buy' ? 'sell' : 'buy', 'market', this.currentSize);
                this.closeID = res.result.id;
                this.closeTime = Date.now();
            }
            catch (e) {
                this.closeID = 0;
            }
        });
    }
    closeLimit(price, postOnly = true, cancelSec = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closeID > 0) {
                throw Error('Position is already closed.');
            }
            this.closeID = 1;
            try {
                const res = yield this.placeOrder(this.openSide === 'buy' ? 'sell' : 'buy', 'limit', this.currentSize, price, postOnly);
                this.closeID = res.result.id;
                this.closeTime = Date.now();
                if (cancelSec > 0) {
                    setTimeout(() => {
                        if (this.closeID !== 0) {
                            this.api.cancelAllOrder({
                                market: this.marketName
                            });
                        }
                    }, cancelSec * 1000);
                }
            }
            catch (e) {
                this.closeID = 0;
            }
        });
    }
    updateOrder(order) {
        if (order.id === this.openID && order.status === 'closed') {
            this.openID = 0;
            if (order.filledSize > 0) {
                this.currentSize += order.filledSize;
                this.targetSize += order.filledSize;
                this.openPrice = order.avgFillPrice ? order.avgFillPrice : order.price;
            }
            if (order.filledSize !== order.size) {
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled();
                }
            }
            if (order.filledSize === order.size) {
                if (this.onOpened) {
                    this.onOpened();
                }
            }
        }
        if (order.id === this.closeID && order.status === 'closed') {
            this.closeID = 0;
            if (order.filledSize > 0) {
                this.currentSize -= order.filledSize;
                this.closePrice = order.avgFillPrice ? order.avgFillPrice : order.price;
            }
            if (order.filledSize !== order.size) {
                if (this.onCloseOrderCanceled) {
                    this.onCloseOrderCanceled();
                }
            }
            if (this.isLosscut && this.currentSize > 0) {
                this.closeMarket();
            }
            else if (this.isLosscut && this.currentSize === 0) {
                this.isLosscut = false;
            }
            if (order.filledSize === order.size) {
                this.isLosscut = false;
                this.cumulativeProfit += this.targetSize *
                    (this.openSide === 'buy' ?
                        (this.closePrice - this.openPrice) :
                        (this.openPrice - this.closePrice));
                this.targetSize = 0;
                this.currentSize = 0;
                if (this.onClosed) {
                    this.onClosed();
                }
            }
        }
    }
    updateFill(fill) {
        if (fill.market === this.marketName) {
            this.cumulativeFee += fill.fee;
        }
    }
    get profit() {
        return this.cumulativeProfit - this.cumulativeFee;
    }
    losscut() {
        this.isLosscut = true;
        this.cancelCloseOrder();
    }
    cancelAll() {
        if (this.closeID > 0 || this.openID > 0) {
            this.api.cancelAllOrder({
                market: this.marketName
            });
        }
    }
    cancelOpenOrder() {
        if (this.openID > 0) {
            this.api.cancelOrder(this.openID);
        }
    }
    cancelCloseOrder() {
        if (this.closeID > 0) {
            this.api.cancelOrder(this.closeID);
        }
    }
    get enabledOpen() {
        return this.openID === 0 &&
            this.closeID === 0 &&
            this.currentSize === 0;
    }
    get enabledClose() {
        return this.openID !== 0 &&
            this.closeID === 0 &&
            this.currentSize > 0;
    }
}
exports.SinglePosition = SinglePosition;
