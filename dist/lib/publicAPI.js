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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FTXPublicApiClass = void 0;
const baseAPI_1 = require("./baseAPI");
const querystring = __importStar(require("querystring"));
const BASE_URL = 'https://ftx.com';
class FTXPublicApiClass extends baseAPI_1.BaseApiClass {
    constructor(config) {
        config.endPoint = config.endPoint || BASE_URL;
        super(config);
    }
    get(path, query) {
        let queryPath = path;
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query);
        }
        return super.get(queryPath, query);
    }
    getMarkets() {
        const path = '/api/markets';
        return this.get(path);
    }
    getSingleMarket(request) {
        const path = '/api/markets/' + request.market_name;
        return this.get(path);
    }
    getOrderbook(market, request) {
        const path = '/api/markets/' + market + '/orderbook';
        return this.get(path, request);
    }
    getTrades(market, request) {
        const path = '/api/markets/' + market + '/trades';
        return this.get(path, request);
    }
    getHistoricalPrices(market, request) {
        const path = '/api/markets/' + market + '/candles';
        return this.get(path, request);
    }
    getFundingRates(request) {
        const path = '/api/funding_rates';
        return this.get(path, request);
    }
    getListAllFutures() {
        const path = '/api/futures';
        return this.get(path, {});
    }
}
exports.FTXPublicApiClass = FTXPublicApiClass;
