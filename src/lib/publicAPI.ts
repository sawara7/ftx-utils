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
    Response,
    Market,
    OrderBook,
    Trade,
    HistoricalPrice,
    FundingRate,
    Future
} from './responseType';

const BASE_URL = 'https://ftx.com';

export class PublicApiClass extends BaseApiClass {
    constructor(config: ApiConfig, options?: BaseApiClassOptions) {
        config.endPoint = config.endPoint || BASE_URL
        super(config, options)
    }

    public getMarkets(): Promise<Response<Market[]>> {
        const path = '/api/markets'
        return this.get(path)
    }

    public getSingleMarket(request: GetSingleMarketRequest): Promise<Response<Market[]>> {
        const path = '/api/markets/' + request.market_name
        return this.get(path)
    }
    
    public getOrderbook(request: GetOrderbookRequest): Promise<Response<OrderBook>> {
        const path = '/api/markets/' + request.market_name + '/orderbook'
        return this.get(path, request)
    }

    public getTrades(request: GetTradesRequest): Promise<Response<Trade>> {
        const path = '/api/markets/' + request.market_name + '/trades'
        return this.get(path, request)
    }

    public getHistoricalPrices(request: GetHistoricalPricesRequest): Promise<Response<HistoricalPrice[]>> {
        const path = '/api/markets/' + request.market_name + '/candles'
        return this.get(path, request)
    }

    public getFundingRates(request: GetFundingRateRequest): Promise<Response<FundingRate[]>> {
        const path = '/api/funding_rates'
        return this.get(path, request)
    }

    public getListAllFutures(): Promise<Response<Future[]>> {
        const path = '/api/futures'
        return this.get(path, {})
    }
}
