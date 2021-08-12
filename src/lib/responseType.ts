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