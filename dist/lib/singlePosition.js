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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SinglePosition = void 0;
var SinglePosition = /** @class */ (function () {
    function SinglePosition(marketName, funds, api) {
        this.marketName = marketName;
        this.funds = funds;
        this.api = api;
        this.positionSize = 0;
        this.openID = 0;
        this.closeID = 0;
        this.openTime = 0;
        this.closeTime = 0;
        this.isLosscut = false;
        this.openSide = 'buy';
        this.openPrice = 0;
        this.openFee = 0;
        this.closePrice = 0;
        this.closeFee = 0;
        this.lastProfit = 0;
        this.cumulativeProfit = 0;
    }
    SinglePosition.prototype.placeOrder = function (side, type, size, price) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.placeOrder({
                            market: this.marketName,
                            side: side,
                            price: price ? price : null,
                            type: type,
                            size: size,
                            reduceOnly: false,
                            ioc: false
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SinglePosition.prototype.openMarket = function (side, price) {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.openID > 0) {
                            throw Error('Position is already opened.');
                        }
                        this.openSide = side;
                        this.openID = 1; // lock
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.placeOrder(side, 'market', this.funds / price)];
                    case 2:
                        res = _a.sent();
                        this.openID = res.result.id;
                        this.openTime = Date.now();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log(e_1);
                        this.openID = 0;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SinglePosition.prototype.openLimit = function (side, price, cancelSec) {
        if (cancelSec === void 0) { cancelSec = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var res, e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.openID > 0) {
                            throw Error('Position is already opened.');
                        }
                        this.openID = 1; // lock
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.placeOrder(side, 'limit', this.funds / price, price)];
                    case 2:
                        res = _a.sent();
                        this.openSide = side;
                        this.openID = res.result.id;
                        this.openTime = Date.now();
                        if (cancelSec > 0) {
                            setInterval(function () {
                                if (_this.openID !== 0) {
                                    _this.api.cancelAllOrder({
                                        market: _this.marketName
                                    });
                                }
                            }, cancelSec * 1000);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        this.openID = 0;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SinglePosition.prototype.closeMarket = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.closeID > 0) {
                            throw Error('Position is already closed.');
                        }
                        this.closeID = 1; // lock
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.placeOrder(this.openSide === 'buy' ? 'sell' : 'buy', 'market', this.positionSize)];
                    case 2:
                        res = _a.sent();
                        this.closeID = res.result.id;
                        this.closeTime = Date.now();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        this.closeID = 0;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SinglePosition.prototype.closeLimit = function (price, cancelSec) {
        if (cancelSec === void 0) { cancelSec = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var res, e_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.closeID > 0) {
                            throw Error('Position is already closed.');
                        }
                        this.closeID = 1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.placeOrder(this.openSide === 'buy' ? 'sell' : 'buy', 'limit', this.positionSize, price)];
                    case 2:
                        res = _a.sent();
                        this.closeID = res.result.id;
                        this.closeTime = Date.now();
                        if (cancelSec > 0) {
                            setInterval(function () {
                                if (_this.openID !== 0) {
                                    _this.api.cancelAllOrder({
                                        market: _this.marketName
                                    });
                                }
                            }, cancelSec * 1000);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        this.closeID = 0;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SinglePosition.prototype.updateOrder = function (order) {
        if (order.id === this.openID) {
            if (order.filledSize !== order.size &&
                order.status === 'closed') {
                this.openID = 0;
                this.positionSize += order.filledSize;
                if (this.onOpenOrderCanceled) {
                    this.onOpenOrderCanceled();
                }
            }
        }
        if (order.id === this.closeID) {
            if (order.filledSize !== order.size &&
                order.status === 'closed') {
                this.closeID = 0;
                this.positionSize -= order.filledSize;
                if (this.onCloseOrderCanceled) {
                    this.onCloseOrderCanceled();
                }
                if (this.isLosscut && this.positionSize > 0) {
                    this.closeMarket();
                }
                else if (this.isLosscut && this.positionSize === 0) {
                    this.isLosscut = false;
                }
            }
        }
    };
    SinglePosition.prototype.updateFill = function (fill) {
        if (this.openID === 0 && this.closeID === 0) {
            return;
        }
        if (this.openID === fill.orderId) {
            this.positionSize += fill.size;
            this.openPrice = fill.price;
            this.openFee = fill.fee;
            this.openID = 0;
            if (this.onOpened) {
                this.onOpened();
            }
        }
        if (this.closeID === fill.orderId) {
            this.positionSize -= fill.size;
            this.closePrice = fill.price;
            this.closeFee = fill.fee;
            this.lastProfit = -(this.openFee + this.closeFee) +
                this.openSide === 'buy' ?
                (this.closePrice - this.openPrice) * fill.size :
                (this.openPrice - this.closePrice) * fill.size;
            this.cumulativeProfit += this.lastProfit;
            this.closeID = 0;
            this.isLosscut = false;
            if (this.onClosed) {
                this.onClosed();
            }
        }
    };
    SinglePosition.prototype.losscut = function () {
        this.isLosscut = true;
        if (this.closeID > 0) {
            this.api.cancelAllOrder({
                market: this.marketName
            });
        }
    };
    SinglePosition.prototype.cancel = function () {
        if (this.closeID > 0 || this.openID > 0) {
            this.api.cancelAllOrder({
                market: this.marketName
            });
        }
    };
    Object.defineProperty(SinglePosition.prototype, "enabledOpen", {
        get: function () {
            return this.openID === 0 &&
                this.closeID === 0 &&
                this.positionSize === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SinglePosition.prototype, "enabledClose", {
        get: function () {
            return this.openID !== 0 &&
                this.closeID === 0 &&
                this.positionSize > 0;
        },
        enumerable: false,
        configurable: true
    });
    return SinglePosition;
}());
exports.SinglePosition = SinglePosition;
