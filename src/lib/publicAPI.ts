import {
    BaseApiClass,
    BaseApiClassOptions,
    ApiConfig
} from './baseAPI';
import {
    GetFundingRateRequest,
    GetHistoricalPricesRequest,
    GetOrderbookRequest,
    GetSingleMarketRequest,
    GetTradesRequest
} from './requestType';
import {
    FTXResponse,
    Market,
    OrderBook,
    Trade,
    HistoricalPrice,
    FundingRate,
    Future
} from './responseType';
import * as querystring from 'querystring'

const BASE_URL = 'https://ftx.com';

export class PublicApiClass extends BaseApiClass {
    constructor(config: ApiConfig, options?: BaseApiClassOptions) {
        config.endPoint = config.endPoint || BASE_URL
        super(config, options)
    }

    get<T>(path: string, query?: {}) {
        let queryPath = path
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query)
        }
        return super.get(queryPath, query)
    }

    public getMarkets(): Promise<FTXResponse<Market[]>> {
        const path = '/api/markets'
        return this.get(path)
    }

    public getSingleMarket(request: GetSingleMarketRequest): Promise<FTXResponse<Market>> {
        const path = '/api/markets/' + request.market_name
        return this.get(path)
    }
    
    public getOrderbook(market: string, request: GetOrderbookRequest): Promise<FTXResponse<OrderBook>> {
        const path = '/api/markets/' + market + '/orderbook'
        return this.get(path, request)
    }

    public getTrades(market: string, request: GetTradesRequest): Promise<FTXResponse<Trade[]>> {
        const path = '/api/markets/' + market + '/trades'
        return this.get(path, request)
    }

    public getHistoricalPrices(market: string, request: GetHistoricalPricesRequest): Promise<FTXResponse<HistoricalPrice[]>> {
        const path = '/api/markets/' + market + '/candles'
        return this.get(path, request)
    }

    public getFundingRates(request: GetFundingRateRequest): Promise<FTXResponse<FundingRate[]>> {
        const path = '/api/funding_rates'
        return this.get(path, request)
    }

    public getListAllFutures(): Promise<FTXResponse<Future[]>> {
        const path = '/api/futures'
        return this.get(path, {})
    }
}
