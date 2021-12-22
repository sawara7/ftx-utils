import { PrivateApiClass, wsFill, wsOrder, wsTicker } from "..";
import { OrderSide, OrderType } from "./utils";
export interface SinglePositionParameters {
    marketName: string;
    funds: number;
    api: PrivateApiClass;
    minOrderInterval?: number;
    openOrderSettings?: OrderSettings;
    closeOrderSettings?: OrderSettings;
}
export interface SinglePositionResponse {
    success: boolean;
    message?: any;
}
export interface OrderSettings {
    side: OrderSide;
    type: OrderType;
    price: number;
    size: number;
    postOnly?: boolean;
    cancelSec?: number;
}
export declare class SinglePosition {
    private static lastOrderTime?;
    private api;
    private marketName;
    private funds;
    private minOrderInterval;
    openOrderSettings?: OrderSettings;
    closeOrderSettings?: OrderSettings;
    private initialSize;
    currentSize: number;
    private openID;
    private closeID;
    private openTime;
    private closeTime;
    isLosscut: boolean;
    openSide: OrderSide;
    currentOpenPrice: number;
    currentClosePrice: number;
    private cumulativeFee;
    private cumulativeProfit;
    onOpened?: (pos: SinglePosition) => void;
    onClosed?: (pos: SinglePosition) => void;
    onOpenOrderCanceled?: (pos: SinglePosition) => void;
    onCloseOrderCanceled?: (pos: SinglePosition) => void;
    constructor(params: SinglePositionParameters);
    private placeOrder;
    private SetOpen;
    private SetClose;
    open(): Promise<SinglePositionResponse>;
    close(): Promise<SinglePositionResponse>;
    openMarket(side: OrderSide, price: number): Promise<SinglePositionResponse>;
    openLimit(side: 'buy' | 'sell', price: number, postOnly?: boolean, cancelSec?: number): Promise<SinglePositionResponse>;
    closeMarket(): Promise<SinglePositionResponse>;
    closeLimit(price: number, postOnly?: boolean, cancelSec?: number): Promise<SinglePositionResponse>;
    updateTicker(ticker: wsTicker): void;
    updateOrder(order: wsOrder): void;
    updateFill(fill: wsFill): void;
    get profit(): number;
    losscut(): void;
    cancelAll(): void;
    cancelOpenOrder(): void;
    cancelCloseOrder(): void;
    get enabledOpen(): Boolean;
    get enabledClose(): Boolean;
}
