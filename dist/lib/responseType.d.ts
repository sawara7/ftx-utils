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
    coin: string;
    free: number;
    availableWithoutBorrow: number;
    usdValue: number;
    spotBorrow: number;
}
export interface Market {
    name: string;
    baseCurrency: string;
    quoteCurrency: string;
    quoteVolume24h: number;
    change1h: number;
    change24h: number;
    changeBod: number;
    highLeverageFeeExempt: boolean;
    minProvideSize: number;
    type: string;
    underlying: string;
    enabled: boolean;
    ask: number;
    bid: number;
    last: number;
    postOnly: boolean;
    price: number;
    priceIncrement: number;
    sizeIncrement: number;
    restricted: boolean;
    volumeUsd24h: number;
}
export interface OrderBook {
    asks: number[];
    bids: number[];
}
export interface Trade {
    id: number;
    liquidation: boolean;
    price: number;
    side: string;
    size: number;
    time: string;
}
export interface HistoricalPrice {
    startTime: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}
export interface FundingRate {
    future: string;
    rate: number;
    time: string;
}
export interface FundingRatePayment {
    future: string;
    id: number;
    payment: number;
    time: string;
    rate: number;
}
export interface Future {
    ask: number;
    bid: number;
    change1h: number;
    change24h: number;
    changeBod: number;
    volumeUsd24h: number;
    volume: number;
    description: string;
    enabled: boolean;
    expired: boolean;
    expiry: string;
    index: number;
    imfFactor: number;
    last: number;
    lowerBound: number;
    mark: number;
    name: string;
    openInterest: number;
    openInterestUsd: number;
    perpetual: boolean;
    positionLimitWeight: number;
    postOnly: boolean;
    priceIncrement: number;
    sizeIncrement: number;
    underlying: string;
    upperBound: number;
    type: string;
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
    status: string;
    createdAt: string;
    reduceOnly: boolean;
    ioc: boolean;
    postOnly: boolean;
    clientId?: string;
}
export interface PlaceOrderResponce {
    createdAt: string;
    filledSize: number;
    future: string;
    id: number;
    market: string;
    price: number;
    remainingSize: number;
    side: string;
    size: number;
    status: string;
    type: string;
    reduceOnly: boolean;
    ioc: boolean;
    postOnly: boolean;
    clientId: string;
}
export interface GetFillsResponse {
    fee: number;
    feeCurrency: string;
    feeRate: number;
    future: string;
    id: number;
    liquidity: string;
    market: string;
    baseCurrency: string;
    quoteCurrency: string;
    orderId: number;
    tradeId: number;
    price: number;
    side: string;
    size: number;
    time: string;
    type: string;
}
export interface GetOrderHistoryResponse {
    id: number;
    market: string;
    type: string;
    side: string;
    price: number;
    size: number;
    filledSize: number;
    remainingSize: number;
    avgFillPrice: number;
    status: string;
    createdAt: string;
    reduceOnly: boolean;
    ioc: boolean;
    postOnly: boolean;
    clientId?: string;
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
