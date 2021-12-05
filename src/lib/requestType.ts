export interface GetAllSubaccountRequest {
    symbol: string
    limit?: number
}

export interface GetSingleMarketRequest {
    market_name: string
}

export interface GetOrderbookRequest {
    depth: number
}

export interface GetTradesRequest {
    start_time?: number //number	1559881511	optional
    end_time?: number //1559881711	optional
}

export interface GetHistoricalPricesRequest {
    resolution: number //300	window length in seconds. options: 15, 60, 300, 900, 3600, 14400, 86400
    start_time?: number //1559881511	optional
    end_time?: number //1559881711	optional
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

export interface PlaceOrderRequest {
    market:	string; //	XRP-PERP	e.g. "BTC/USD" for spot, "XRP-PERP" for futures
    side: string; //	sell	"buy" or "sell" 
    price: number | null; // 0.306525	Send null for market orders.
    type: string; //	limit	"limit" or "market"
    size: number; //	31431.0	
    reduceOnly?: boolean; //	false	optional; default is false
    ioc?: boolean; //	false	optional; default is false
    postOnly?: boolean; //	false	optional; default is false
    clientId?: string; //	null	optional; client order id
    rejectOnPriceBand?: boolean; //	false	optional; if the order should be rejected if its price would instead be adjusted due to price bands
}

export interface GetFillsRequest {
    market: string; //BTC-0329	optional; market to limit fills
    start_time?:	number;	//1564146934	optional; minimum time of fills to return, in Unix time (seconds since 1970-01-01)
    end_time?: number;	//1564233334	optional; maximum time of fills to return, in Unix time (seconds since 1970-01-01)
    order?: string; //null	optional; default is descending, supply 'asc' to receive fills in ascending order of time
    orderId?: number; //null
}

export interface GetOrderHistoryRequest {
    market: string;	//BTC-0329	optional; market to limit orders
    side?: string; //buy	optional; buy or sell side
    orderType?: string; //limit	optional; market or limit orders
    start_time?: number; //1559881511	optional; only fetch orders created after this time
    end_time?: number; //1559901511	optional; only fetch orders created before this time
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