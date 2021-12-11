export interface wsTrade {
    id: number;
    time: string;
    side: string;
    size: number;
    price: number;
    liquidation: boolean;
}
export interface wsTicker {
    time: string;
    bid: number;
    ask: number;
    last: number;
}
export interface wsFill {
    fee: number;
    feeRate: number;
    future: string;
    id: number;
    liquidity: string;
    market: string;
    orderId: number;
    tradeId: number;
    price: number;
    side: string;
    size: number;
    time: string;
    type: string;
}
export interface wsOrder {
    id: number;
    clientId?: string;
    market: string;
    type: string;
    side: string;
    size: number;
    price: number;
    reduceOnly: boolean;
    ioc: boolean;
    postOnly: boolean;
    status: string;
    filledSize: number;
    remainingSize: number;
    avgFillPrice: number;
}
export declare class WebsocketAPI {
    private socket;
    onTrades: ((trades: wsTrade[]) => void) | undefined;
    onTicker: ((ticer: wsTicker) => void) | undefined;
    onFill: ((fill: wsFill) => void) | undefined;
    onOrder: ((orders: wsOrder) => void) | undefined;
    constructor();
    private onOpen;
    private onError;
    private onMessage;
    login(apiKey: string, secret: string, subaccount: string): void;
    subscribePublic(ch: "trades" | "ticker", market: string): void;
    subscribePricate(ch: "fills" | "orders"): void;
}
