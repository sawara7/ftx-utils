"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.FTXPrivateApiClass = void 0;
const crypto = __importStar(require("crypto"));
const baseAPI_1 = require("./baseAPI");
const querystring = __importStar(require("querystring"));
const my_utils_1 = require("my-utils");
const BASE_URL = 'https://ftx.com';
class FTXPrivateApiClass extends baseAPI_1.BaseApiClass {
    constructor(config) {
        config.endPoint = config.endPoint || BASE_URL;
        super(config);
        this._apiKey = config.apiKey;
        this._apiSecret = config.apiSecret;
        this._subAccount = config.subAccount;
        this._minOrderInterval = config.minOrderInterval || 200;
        if (!FTXPrivateApiClass._lastOrderTime) {
            FTXPrivateApiClass._lastOrderTime = {};
        }
    }
    static toSha256(key, value) {
        return crypto
            .createHmac('sha256', key)
            .update(Buffer.from(value))
            .digest('hex')
            .toString();
    }
    getAllSubaccounts() {
        const path = '/api/subaccounts';
        return this.get(path, {});
    }
    getBalances() {
        const path = '/api/wallet/balances';
        return this.get(path, {});
    }
    getAllBalances() {
        const path = '/api/wallet/all_balances';
        return this.get(path, {});
    }
    getFundingPayment(params) {
        const path = '/api/funding_payments';
        return this.get(path, params);
    }
    getOpenOrders() {
        const path = '/api/orders';
        return this.get(path, {});
    }
    placeOrder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = '/api/orders';
            yield this.sleepWhileOrderInterval(params.market);
            return yield this.post(path, params);
        });
    }
    getFills(params) {
        const path = '/api/fills';
        return this.get(path, params);
    }
    getOrderHistory(params) {
        const path = '/api/orders/history';
        return this.get(path, params);
    }
    requestWithdrawal(params) {
        const path = '/api/wallet/withdrawals';
        return this.post(path, params);
    }
    cancelAllOrder(params) {
        const path = '/api/orders';
        return this.delete(path, params);
    }
    cancelOrder(id) {
        const path = '/api/orders/' + id;
        return this.delete(path, {});
    }
    cancelOrderByClientID(id) {
        const path = '/api/orders/by_client_id/' + id;
        return this.delete(path, {});
    }
    getPositions(params) {
        const path = '/api/positions';
        return this.get(path, params);
    }
    get(path, query) {
        let queryPath = path;
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query);
        }
        return super.get(queryPath, query, this.makeHeader('GET', queryPath));
    }
    post(path, body) {
        return super.post(path, body, this.makeHeader('POST', path, JSON.stringify(body)));
    }
    delete(path, query) {
        let queryPath = path;
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query);
        }
        return super.delete(queryPath, query, this.makeHeader('DELETE', queryPath));
    }
    makeHeader(method, path, body = '') {
        const ts = Date.now();
        const s = ts + method + path + (method === 'POST' ? body : '');
        const sign = FTXPrivateApiClass.toSha256(this._apiSecret, s);
        const header = {
            'FTX-KEY': this._apiKey,
            'FTX-TS': ts.toString(),
            'FTX-SIGN': sign
        };
        if (this._subAccount) {
            Object.assign(header, { 'FTX-SUBACCOUNT': this._subAccount });
        }
        return header;
    }
    sleepWhileOrderInterval(market) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FTXPrivateApiClass._lastOrderTime) {
                throw new Error('no last order');
            }
            if (FTXPrivateApiClass._lastOrderTime[market]) {
                const interval = Date.now() - FTXPrivateApiClass._lastOrderTime[market];
                if (interval > 0) {
                    if (interval < this._minOrderInterval) {
                        FTXPrivateApiClass._lastOrderTime[market] += this._minOrderInterval;
                        yield (0, my_utils_1.sleep)(this._minOrderInterval - interval);
                    }
                    else if (interval > this._minOrderInterval) {
                        FTXPrivateApiClass._lastOrderTime[market] = Date.now();
                    }
                }
                else if (interval < 0) {
                    FTXPrivateApiClass._lastOrderTime[market] += this._minOrderInterval;
                    yield (0, my_utils_1.sleep)(FTXPrivateApiClass._lastOrderTime[market] - Date.now());
                }
            }
            else {
                FTXPrivateApiClass._lastOrderTime[market] = Date.now();
            }
        });
    }
}
exports.FTXPrivateApiClass = FTXPrivateApiClass;
