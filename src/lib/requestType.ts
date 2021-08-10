export interface GetAllSubaccountRequest {
    symbol: string
    limit?: number
}

export interface GetSingleMarketRequest {
    market_name: string
}

export interface GetOrderbookRequest {
    market_name: string
    depth: number
}

export interface GetTradesRequest {
    market_name: string	//string	BTC-0628	name of the market
    limit: number //35	optional, max 100, default 20
    start_time: number //number	1559881511	optional
    end_time: number //1559881711	optional
}

export interface GetHistoricalPricesRequest {
    market_name: string	//BTC-0628	name of the market
    resolution: number //300	window length in seconds. options: 15, 60, 300, 900, 3600, 14400, 86400
    limit: number //35	optional, max 5000
    start_time: number //1559881511	optional
    end_time: number //1559881711	optional
}

export interface GetFundingRateRequest {
    start_time?: number
    end_time?: number
    future?: string
}

export interface GetFundingPaymentRequest {
    start_time?: number
    end_time?: number
    future?: string
}
