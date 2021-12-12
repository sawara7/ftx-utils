import { PrivateApiClass, wsFill, wsOrder } from "..";
export declare class SinglePosition {
    private marketName;
    private funds;
    private openSide;
    private api;
    private positionSize;
    private openID;
    private closeID;
    private openTime;
    private closeTime;
    onOpened?: () => void;
    onClosed?: () => void;
    onOpenOrderCanceled?: () => void;
    onCloseOrderCanceled?: () => void;
    constructor(marketName: string, funds: number, openSide: 'buy' | 'sell', api: PrivateApiClass);
    private placeOrder;
    openMarket(price: number): Promise<void>;
    openLimit(price: number, cancelSec?: number): Promise<void>;
    closeMarket(): Promise<void>;
    closeLimit(price: number, cancelSec?: number): Promise<void>;
    updateOrder(order: wsOrder): void;
    updateFill(fill: wsFill): void;
}
