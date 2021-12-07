"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var crypto = __importStar(require("crypto"));
var baseAPI_1 = require("./baseAPI");
var querystring = __importStar(require("querystring"));
var BASE_URL = 'https://ftx.com';
var PrivateApiClass = /** @class */ (function (_super) {
    __extends(PrivateApiClass, _super);
    function PrivateApiClass(config, options) {
        var _this = this;
        config.endPoint = config.endPoint || BASE_URL;
        _this = _super.call(this, config, options) || this;
        _this.apiKey = config.apiKey;
        _this.apiSecret = config.apiSecret;
        _this.subAccount = config.subAccount;
        return _this;
    }
    PrivateApiClass.toSha256 = function (key, value) {
        return crypto
            .createHmac('sha256', key)
            .update(Buffer.from(value))
            .digest('hex')
            .toString();
    };
    PrivateApiClass.prototype.getAllSubaccounts = function () {
        var path = '/api/subaccounts';
        return this.get(path, {});
    };
    PrivateApiClass.prototype.getBalances = function () {
        var path = '/api/wallet/balances';
        return this.get(path, {});
    };
    PrivateApiClass.prototype.getAllBalances = function () {
        var path = '/api/wallet/all_balances';
        return this.get(path, {});
    };
    PrivateApiClass.prototype.getFundingPayment = function (params) {
        var path = '/api/funding_payments';
        return this.get(path, params);
    };
    PrivateApiClass.prototype.getOpenOrders = function () {
        var path = '/api/orders';
        return this.get(path, {});
    };
    PrivateApiClass.prototype.placeOrder = function (params) {
        var path = '/api/orders';
        return this.post(path, params);
    };
    PrivateApiClass.prototype.getFills = function (params) {
        var path = '/api/fills';
        return this.get(path, params);
    };
    PrivateApiClass.prototype.getOrderHistory = function (params) {
        var path = '/api/orders/history';
        return this.get(path, params);
    };
    PrivateApiClass.prototype.requestWithdrawal = function (params) {
        var path = '/api/wallet/withdrawals';
        return this.post(path, params);
    };
    PrivateApiClass.prototype.cancelAllOrder = function (params) {
        var path = '/api/orders';
        return this.delete(path, params);
    };
    PrivateApiClass.prototype.get = function (path, query) {
        var queryPath = path;
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query);
        }
        return _super.prototype.get.call(this, queryPath, query, this.makeHeader('GET', queryPath));
    };
    PrivateApiClass.prototype.post = function (path, body) {
        return _super.prototype.post.call(this, path, body, this.makeHeader('POST', path, JSON.stringify(body)));
    };
    PrivateApiClass.prototype.delete = function (path, query) {
        var queryPath = path;
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query);
        }
        return _super.prototype.delete.call(this, queryPath, query, this.makeHeader('DELETE', queryPath));
    };
    PrivateApiClass.prototype.makeHeader = function (method, path, body) {
        if (body === void 0) { body = ''; }
        var ts = Date.now();
        var s = ts + method + path + (method === 'POST' ? body : '');
        console.log(s);
        var sign = PrivateApiClass.toSha256(this.apiSecret, s);
        var header = {
            'FTX-KEY': this.apiKey,
            'FTX-TS': ts.toString(),
            'FTX-SIGN': sign
        };
        if (this.subAccount) {
            Object.assign(header, { 'FTX-SUBACCOUNT': this.subAccount });
        }
        return header;
    };
    return PrivateApiClass;
}(baseAPI_1.BaseApiClass));
exports.PrivateApiClass = PrivateApiClass;
