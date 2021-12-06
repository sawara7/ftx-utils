import { BaseApiClass, BaseApiClassOptions, ApiConfig } from './baseAPI';
import { GetFundingRateRequest, GetHistoricalPricesRequest, GetOrderbookRequest, GetSingleMarketRequest, GetTradesRequest } from './requestType';
import { Response, Market, OrderBook, Trade, HistoricalPrice, FundingRate, Future } from './responseType';
export declare class PublicApiClass extends BaseApiClass {
    constructor(config: ApiConfig, options?: BaseApiClassOptions);
    get<T>(path: string, query?: {}): Promise<any>;
    getMarkets(): Promise<Response<Market[]>>;
    getSingleMarket(request: GetSingleMarketRequest): Promise<Response<Market>>;
    getOrderbook(market: string, request: GetOrderbookRequest): Promise<Response<OrderBook>>;
    getTrades(market: string, request: GetTradesRequest): Promise<Response<Trade[]>>;
    getHistoricalPrices(market: string, request: GetHistoricalPricesRequest): Promise<Response<HistoricalPrice[]>>;
    getFundingRates(request: GetFundingRateRequest): Promise<Response<FundingRate[]>>;
    getListAllFutures(): Promise<Response<Future[]>>;
}
