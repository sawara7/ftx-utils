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
const utils_1 = require("./utils");
class SinglePosition {
    constructor(params) {
        // Position State
        this.initialSize = 0;
        this.currentSize = 0;
        this.openID = 0;
        this.closeID = 0;
        this.openTime = 0;
        this.closeTime = 0;
        this.isLosscut = false;
        this.openSide = 'buy';
        this.currentOpenPrice = 0;
        this.currentClosePrice = 0;
        this.cumulativeFee = 0;
        this.cumulativeProfit = 0;
        if (!SinglePosition.lastOrderTime) {
            SinglePosition.lastOrderTime = {};
        }
        this.marketName = params.marketName;
        if (!SinglePosition.lastOrderTime[this.marketName]) {
            SinglePosition.lastOrderTime[this.marketName] = Date.now();
        }
        this.funds = params.funds;
        this.api = params.api;
        this.minOrderInterval = params.minOrderInterval || 200;
        this.openOrderSettings = params.openOrderSettings;
        this.closeOrderSettings = params.closeOrderSettings;
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
            console.log(SinglePosition.lastOrderTime);
            if (SinglePosition.lastOrderTime && SinglePosition.lastOrderTime[this.marketName]) {
                const interval = Date.now() - SinglePosition.lastOrderTime[this.marketName];
                console.log(interval);
                if (interval > 0) {
                    if (interval < this.minOrderInterval) {
                        SinglePosition.lastOrderTime[this.marketName] += this.minOrderInterval;
                        yield utils_1.sleep(this.minOrderInterval - interval);
                    }
                    else if (interval > this.minOrderInterval) {
                        SinglePosition.lastOrderTime[this.marketName] = Date.now();
                    }
                }
                else if (interval < 0) {
                    SinglePosition.lastOrderTime[this.marketName] += this.minOrderInterval;
                    yield utils_1.sleep(SinglePosition.lastOrderTime[this.marketName] - Date.now());
                }
            }
            return yield this.api.placeOrder(p);
        });
    }
    SetOpen(res) {
        this.openSide = res.side === 'buy' ? 'buy' : 'sell';
        this.openID = res.id;
        this.openTime = Date.now();
    }
    SetClose(res) {
        this.closeID = res.id;
        this.closeTime = Date.now();
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.openOrderSettings) {
                return { success: false, message: 'No open order settings.' };
            }
            if (this.openOrderSettings.type === 'limit') {
                return yield this.openLimit(this.openOrderSettings.side, this.openOrderSettings.price, this.openOrderSettings.postOnly, this.openOrderSettings.cancelSec || 0);
            }
            else if (this.openOrderSettings.type === 'market') {
                return yield this.openMarket(this.openOrderSettings.side, this.openOrderSettings.price);
            }
            return { success: false, message: 'Open Failed.' };
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closeOrderSettings) {
                return { success: false, message: 'No close order settings.' };
            }
            if (this.closeOrderSettings.type === 'limit') {
                return yield this.closeLimit(this.closeOrderSettings.price, this.closeOrderSettings.postOnly, this.closeOrderSettings.cancelSec || 0);
            }
            else if (this.closeOrderSettings.type === 'market') {
                return yield this.closeMarket();
            }
            return { success: false, message: 'Close Failed.' };
        });
    }
    openMarket(side, price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openID > 0) {
                return { success: false, message: 'Position is already opened.' };
            }
            const result = {
                success: false
            };
            this.openID = 1; // lock
            try {
                const res = yield this.placeOrder(side, 'market', this.funds / price);
                this.SetOpen(res.result);
                result.success = true;
            }
            catch (e) {
                result.message = e;
                this.openID = 0;
            }
            return result;
        });
    }
    openLimit(side, price, postOnly = true, cancelSec = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openID > 0) {
                return { success: false, message: 'Position is already opened.' };
            }
            const result = {
                success: false
            };
            this.openID = 1; // lock
            try {
                const res = yield this.placeOrder(side, 'limit', this.funds / price, price, postOnly);
                this.SetOpen(res.result);
                result.success = true;
                if (cancelSec > 0) {
                    setTimeout(() => {
                        if (this.openID !== 0) {
                            this.api.cancelOrder(this.openID);
                        }
                    }, cancelSec * 1000);
                }
            }
            catch (e) {
                result.message = e;
                this.openID = 0;
            }
            return result;
        });
    }
    closeMarket() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closeID > 0) {
                return { success: false, message: 'Position is already closed.' };
            }
            const result = {
                success: false
            };
            this.closeID = 1; // lock
            try {
                const res = yield this.placeOrder(this.openSide === 'buy' ? 'sell' : 'buy', 'market', this.currentSize);
                this.SetClose(res.result);
                result.success = true;
            }
            catch (e) {
                result.message = e;
                this.closeID = 0;
            }
            return result;
        });
    }
    closeLimit(price, postOnly = true, cancelSec = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.closeID > 0) {
                return { success: false, message: 'Position is already closed.' };
            }
            const result = {
                success: false
            };
            this.closeID = 1;
            try {
                const res = yield this.placeOrder(this.openSide === 'buy' ? 'sell' : 'buy', 'limit', this.currentSize, price, postOnly);
                this.SetClose(res.result);
                result.success = true;
                if (cancelSec > 0) {
                    setTimeout(() => {
                        if (this.closeID !== 0) {
                            this.api.cancelOrder(this.closeID);
                        }
                    }, cancelSec * 1000);
                }
            }
            catch (e) {
                result.message = e;
                this.closeID = 0;
            }
            return result;
        });
    }
    updateOrder(order) {
        if (order.id === this.openID && order.status === 'closed') {
            this.openID = 0;
            if (order.filledSize > 0) {
                this.currentSize += order.filledSize;
                this.initialSize += order.filledSize;
                this.currentOpenPrice = order.avgFillPrice ? order.avgFillPrice : order.price;
            }
            if (order.filledSize !== order.size) {
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled(this);
                }
            }
            if (order.filledSize === order.size) {
                if (this.onOpened) {
                    this.onOpened(this);
                }
            }
        }
        if (order.id === this.closeID && order.status === 'closed') {
            this.closeID = 0;
            if (order.filledSize > 0) {
                this.currentSize -= order.filledSize;
                this.currentClosePrice = order.avgFillPrice ? order.avgFillPrice : order.price;
            }
            if (order.filledSize !== order.size) {
                if (this.onCloseOrderCanceled) {
                    this.onCloseOrderCanceled(this);
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
                this.cumulativeProfit += this.initialSize *
                    (this.openSide === 'buy' ?
                        (this.currentClosePrice - this.currentOpenPrice) :
                        (this.currentOpenPrice - this.currentClosePrice));
                this.initialSize = 0;
                this.currentSize = 0;
                if (this.onClosed) {
                    this.onClosed(this);
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
