import { BasePositionClass, MarketInfo, OrderSide, OrderType } from "trade-utils";
import { PrivateApiClass, wsOrder, wsTicker } from "..";
import { FTXOrderClass } from "./order";
export interface FTXSinglePositionParameters {
    marketInfo: MarketInfo;
    openSide: OrderSide;
    orderType: OrderType;
    funds: number;
    api: PrivateApiClass;
    openPrice: number;
    closePrice: number;
    minOrderInterval?: number;
}
export declare class FTXSinglePosition extends BasePositionClass {
    private static _lastOrderTime?;
    private _api;
    private _minOrderInterval;
    private _marketInfo;
    private _initialSize;
    private _currentSize;
    private _openPrice;
    private _closePrice;
    private _openOrder;
    private _closeOrder;
    private _openID;
    private _closeID;
    constructor(params: FTXSinglePositionParameters);
    private static initializeLastOrderTime;
    private sleepWhileOrderInterval;
    private placeOrder;
    doOpen(): Promise<void>;
    doClose(): Promise<void>;
    updateTicker(ticker: wsTicker): void;
    updateOrder(order: wsOrder): void;
    get activeID(): string;
    get enabledOpen(): boolean;
    get enabledClose(): boolean;
    get openOrder(): FTXOrderClass;
    get closeOrder(): FTXOrderClass;
    get currentOpenPrice(): number;
    get currentClosePrice(): number;
    set bestAsk(value: number);
    set bestBid(value: number);
}
