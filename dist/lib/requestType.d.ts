export interface GetAllSubaccountRequest {
    symbol: string;
    limit?: number;
}
export interface GetSingleMarketRequest {
    market_name: string;
}
export interface GetOrderbookRequest {
    depth: number;
}
export interface GetTradesRequest {
    start_time?: number;
    end_time?: number;
}
export interface GetHistoricalPricesRequest {
    resolution: number;
    start_time?: number;
    end_time?: number;
}
export interface GetFundingRateRequest {
    start_time?: number;
    end_time?: number;
    future?: string;
}
export interface GetFundingPaymentRequest {
    start_time?: number;
    end_time?: number;
    future?: string;
}
export interface PlaceOrderRequest {
    market: string;
    side: string;
    price: number | null;
    type: string;
    size: number;
    reduceOnly?: boolean;
    ioc?: boolean;
    postOnly?: boolean;
    clientId?: string;
    rejectOnPriceBand?: boolean;
}
export interface GetFillsRequest {
    market: string;
    start_time?: number;
    end_time?: number;
    order?: string;
    orderId?: number;
}
export interface GetOrderHistoryRequest {
    market: string;
    side?: string;
    orderType?: string;
    start_time?: number;
    end_time?: number;
}
export interface WithdrawalRequest {
    coin: string;
    size: number;
    address: string;
    tag: string | null;
    method: string | null;
    password: string | null;
    code: string | null;
}
export interface CancelAllOrdersRequest {
    market?: string;
    side?: string;
    conditionalOrdersOnly?: boolean;
    limitOrdersOnly?: boolean;
}
