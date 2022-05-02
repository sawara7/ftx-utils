export interface FTXResponse<T> {
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
    name: string, //BTC-0628	e.g. "BTC/USD" for spot, "BTC-PERP" for futures
    baseCurrency: string, //BTC	spot markets only
    quoteCurrency: string, //USD	spot markets only
    quoteVolume24h: number,	//28914.76	
    change1h: number,	//0.012	change in the past hour
    change24h: number,	//0.0299	change in the past 24 hours
    changeBod: number,	//0.0156	change since start of day (00:00 UTC)
    highLeverageFeeExempt: boolean, //false	
    minProvideSize: number,	//0.001 Minimum maker order size (if >10 orders per hour fall below this size)
    type: string,	//future	"future" or "spot"
    underlying: string,	//BTC	future markets only
    enabled: boolean, //true	
    ask: number,	//3949.25	best ask
    bid: number,	//3949.00	best bid
    last: number,	//3949.00	last traded price
    postOnly: boolean, //false	if the market is in post-only mode (all orders get modified to be post-only, in addition to other settings they may have)
    price: number, //10579.52	current price
    priceIncrement: number, //0.25	
    sizeIncrement: number, //0.0001	
    restricted: boolean, //false	if the market has nonstandard restrictions on which jurisdictions can trade it
    volumeUsd24h: number, //28914.76	USD volume in past 24 hours
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

export interface PositionResponse {
    cost: number; //-31.7906	Amount that was paid to enter this position, equal to size * entry_price. Positive if long, negative if short.
    cumulativeBuySize: number; //1.2	
    cumulativeSellSize: number; //0.0	
    entryPrice: number; //138.22	Average cost of this position after pnl was last realized: whenever unrealized pnl gets realized, this field gets set to mark price, unrealizedPnL is set to 0, and realizedPnl changes by the previous value for unrealizedPnl.
    estimatedLiquidationPrice: number; //152.1	
    future: string; //ETH-PERP	future name
    initialMarginRequirement: number; //0.1	Minimum margin fraction for opening new positions
    longOrderSize: number; //1744.55	Cumulative size of all open bids
    maintenanceMarginRequirement: number; //0.04	Minimum margin fraction to avoid liquidations
    netSize: number; //-0.23	Size of position. Positive if long, negative if short.
    openSize: number; //1744.32	Maximum possible absolute position size if some subset of open orders are filled
    realizedPnl: number; //3.39441714	
    recentAverageOpenPrice: number; //135.31	
    recentBreakEvenPrice: number; //135.31	
    recentPnl: number; //3.1134	
    shortOrderSize: number; //1732.09	Cumulative size of all open offers
    side: string;	//sell	sell if short, buy if long
    size: number; //0.23 Absolute value of netSize
    unrealizedPnl: number; //0.0	
    collateralUsed: number; //3.17906
        /* Is equal to:
        For PRESIDENT: initialMarginRequirement * openSize * (risk price)
        For MOVE: initialMarginRequirement * openSize * (index price)
        Otherwise: initialMarginRequirement * openSize * (mark price) */
}