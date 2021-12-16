import { PrivateApiClass, wsFill, wsOrder } from "..";
export declare class SinglePosition {
    private marketName;
    private funds;
    private api;
    private targetSize;
    currentSize: number;
    private openID;
    private closeID;
    private openTime;
    private closeTime;
    isLosscut: boolean;
    openSide: 'buy' | 'sell';
    onOpened?: () => void;
    onClosed?: () => void;
    onOpenOrderCanceled?: () => void;
    onCloseOrderCanceled?: () => void;
    openPrice: number;
    closePrice: number;
    private cumulativeFee;
    private cumulativeProfit;
    constructor(marketName: string, funds: number, api: PrivateApiClass);
    private placeOrder;
    openMarket(side: 'buy' | 'sell', price: number): Promise<void>;
    openLimit(side: 'buy' | 'sell', price: number, postOnly?: boolean, cancelSec?: number): Promise<void>;
    closeMarket(): Promise<void>;
    closeLimit(price: number, postOnly?: boolean, cancelSec?: number): Promise<void>;
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
