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
exports.PublicApiClass = void 0;
var baseAPI_1 = require("./baseAPI");
var querystring = __importStar(require("querystring"));
var BASE_URL = 'https://ftx.com';
var PublicApiClass = /** @class */ (function (_super) {
    __extends(PublicApiClass, _super);
    function PublicApiClass(config, options) {
        var _this = this;
        config.endPoint = config.endPoint || BASE_URL;
        _this = _super.call(this, config, options) || this;
        return _this;
    }
    PublicApiClass.prototype.get = function (path, query) {
        var queryPath = path;
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query);
        }
        return _super.prototype.get.call(this, queryPath, query);
    };
    PublicApiClass.prototype.getMarkets = function () {
        var path = '/api/markets';
        return this.get(path);
    };
    PublicApiClass.prototype.getSingleMarket = function (request) {
        var path = '/api/markets/' + request.market_name;
        return this.get(path);
    };
    PublicApiClass.prototype.getOrderbook = function (market, request) {
        var path = '/api/markets/' + market + '/orderbook';
        return this.get(path, request);
    };
    PublicApiClass.prototype.getTrades = function (market, request) {
        var path = '/api/markets/' + market + '/trades';
        return this.get(path, request);
    };
    PublicApiClass.prototype.getHistoricalPrices = function (market, request) {
        var path = '/api/markets/' + market + '/candles';
        return this.get(path, request);
    };
    PublicApiClass.prototype.getFundingRates = function (request) {
        var path = '/api/funding_rates';
        return this.get(path, request);
    };
    PublicApiClass.prototype.getListAllFutures = function () {
        var path = '/api/futures';
        return this.get(path, {});
    };
    return PublicApiClass;
}(baseAPI_1.BaseApiClass));
exports.PublicApiClass = PublicApiClass;
