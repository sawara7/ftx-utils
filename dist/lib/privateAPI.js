"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateApiClass = void 0;
const crypto = __importStar(require("crypto"));
const baseAPI_1 = require("./baseAPI");
const querystring = __importStar(require("querystring"));
const BASE_URL = 'https://ftx.com';
class PrivateApiClass extends baseAPI_1.BaseApiClass {
    constructor(config, options) {
        config.endPoint = config.endPoint || BASE_URL;
        super(config, options);
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
        this.subAccount = config.subAccount;
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
        const path = '/api/orders';
        return this.post(path, params);
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
        const sign = PrivateApiClass.toSha256(this.apiSecret, s);
        const header = {
            'FTX-KEY': this.apiKey,
            'FTX-TS': ts.toString(),
            'FTX-SIGN': sign
        };
        if (this.subAccount) {
            Object.assign(header, { 'FTX-SUBACCOUNT': this.subAccount });
        }
        return header;
    }
}
exports.PrivateApiClass = PrivateApiClass;
