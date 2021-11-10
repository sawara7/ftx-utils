export interface Response<T> {
    success: number;
    result: T;
}

export interface Subaccount {
    nickname: string;
    deletable: boolean;
    editable: boolean;
    competition: boolean;
}

export interface Balance {
    coin: string,
    free: number,
    availableWithoutBorrow: number,
    usdValue: number,
    spotBorrow: number
}

export interface Market {
    name: string
    baseCurrency: number
    quoteCurrency: number
    type: string
    underlying: string
    enabled: boolean
    ask: number
    bid: number
    last: number
    postOnly: boolean
    priceIncrement: number
    sizeIncrement: number
    restricted: boolean
}

export interface OrderBook {
    asks: number[]
    bids: number[]
}

export interface Trade {
    id:	number	//3855995	trade id
    liquidation: boolean //false	if this trade involved a liquidation order
    price: number //3857.75	
    side: string //buy	
    size: number //0.111	
    time: string //2019-03-20T18:16:23.397991+00:00
}

export interface HistoricalPrice {
    startTime: string //2019-06-24T17:15:00+00:00	start time of the window
    open: number //11059.25	mark price at startTime
    close: number //11055.25	mark price at the end of the window: startTime + resolution
    high: number //11089.0	highest mark price over the window
    low: number //11059.25	lowest mark price over the window
    volume: number //464193.95725	volume traded in the window
}

export interface FundingRate {
    future: string
    rate: number
    time: string
}

export interface FundingRatePayment {
    future: string
    id: number
    payment: number
    time: string
    rate: number
}

export interface Future {
    ask: number,
    bid: number,
    change1h: number,
    change24h: number,
    changeBod: number,
    volumeUsd24h: number,
    volume: number,
    description: string,
    enabled: boolean,
    expired: boolean,
    expiry: string,
    index: number,
    imfFactor: number,
    last: number,
    lowerBound: number,
    mark: number,
    name: string,
    openInterest: number,
    openInterestUsd: number,
    perpetual: boolean,
    positionLimitWeight: number,
    postOnly: boolean,
    priceIncrement: number,
    sizeIncrement: number,
    underlying: string,
    upperBound: number,
    type: string
}

export interface OpenOrder {
    id: number;	
    market: string;	
    type: string;	
    side: string;	
    price: number;	
    size: number;	
    filledSize: number;	
    remainingSize: number;	
    avgFillPrice: number;	
    status: string; //new (accepted but not processed yet), open, or closed (filled or cancelled)	
    createdAt: string;	//2019-03-05T09:56:55.728933+00:00	
    reduceOnly: boolean;	//false	
    ioc: boolean;	//false	
    postOnly: boolean;	//false	
    clientId?: string;//optional; client order id
}

export interface PlaceOrderResponce {
    createdAt: string; //2019-03-05T09:56:55.728933+00:00	
    filledSize:	number; //0.0	
    future:	string; //XRP-PERP	
    id:	number; //9596912	
    market:	string; //XRP-PERP	
    price: number; //0.306525	
    remainingSize: number; //31431.0	
    side: string; //sell	
    size: number; //31431.0	
    status:	string; //new (accepted but not processed yet), open, or closed (filled or cancelled)	
    type:	string; //limit	
    reduceOnly:	boolean; //false	
    ioc: boolean; //false	
    postOnly: boolean; //false	
    clientId: string; //optional; client order id, if supplied
}

export interface GetFillsResponse {
    fee: number; //20.1374935	
    feeCurrency: string; //USD	
    feeRate: number; //0.0005	
    future: string; //EOS-0329	
    id: number; //11215	fill id
    liquidity: string; //taker	"taker" or "maker"
    market: string; //EOS-0329	
    baseCurrency: string; //BTC	spot markets only
    quoteCurrency: string; //USD	spot markets only
    orderId: number;	//8436981	
    tradeId: number;	//1013912	null for trades before 2019-02-19 10:00:00
    price: number;	//4.201	
    side: string;	//buy	
    size: number;	//9587.0	
    time: string;	//2019-03-27T19:15:10.204619+00:00	
    type: string;	//order
}

export interface GetOrderHistoryResponse {
    id: number; //257132591	
    market: string; //BTC-PERP
    type: string; //limit	
    side: string; //buy	
    price: number; //10135.25	
    size: number; //0.001	
    filledSize: number; //0.001	
    remainingSize: number; //0.0	
    avgFillPrice: number; //10135.25	
    status: string;	//new (accepted but not processed yet), open, or closed (filled or cancelled)	
    createdAt: string; //2019-06-27T15:24:03.101197+00:00	
    reduceOnly: boolean; //false	
    ioc: boolean; //false	
    postOnly: boolean; //false	
    clientId?: string; //optional; client order id
}

export interface WithdrawalResponse {
    coin: string;
    address: string;
    tag: string | null;
    fee: number;
    id: number;
    size: number;
    status: string;
    time: string;
    txid: string | null;
}