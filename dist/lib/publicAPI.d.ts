import { BaseApiClass, BaseApiClassOptions, ApiConfig } from './baseAPI';
import { GetFundingRateRequest, GetHistoricalPricesRequest, GetOrderbookRequest, GetSingleMarketRequest, GetTradesRequest } from './requestType';
import { FTXResponse, Market, OrderBook, Trade, HistoricalPrice, FundingRate, Future } from './responseType';
export declare class PublicApiClass extends BaseApiClass {
    constructor(config: ApiConfig, options?: BaseApiClassOptions);
    get<T>(path: string, query?: {}): Promise<any>;
    getMarkets(): Promise<FTXResponse<Market[]>>;
    getSingleMarket(request: GetSingleMarketRequest): Promise<FTXResponse<Market>>;
    getOrderbook(market: string, request: GetOrderbookRequest): Promise<FTXResponse<OrderBook>>;
    getTrades(market: string, request: GetTradesRequest): Promise<FTXResponse<Trade[]>>;
    getHistoricalPrices(market: string, request: GetHistoricalPricesRequest): Promise<FTXResponse<HistoricalPrice[]>>;
    getFundingRates(request: GetFundingRateRequest): Promise<FTXResponse<FundingRate[]>>;
    getListAllFutures(): Promise<FTXResponse<Future[]>>;
}
