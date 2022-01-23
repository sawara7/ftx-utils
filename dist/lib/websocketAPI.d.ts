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
export interface wsParameters {
    pingIntervalSec?: number;
    reconnectOnClose?: boolean;
    apiKey?: string;
    apiSecret?: string;
    subAccount?: string;
    onTrades?: (trades: wsTrade[]) => void;
    onTicker?: (ticer: wsTicker) => void;
    onFill?: (fill: wsFill) => void;
    onOrder?: (orders: wsOrder) => void;
    onPong?: () => void;
    onError?: (code: string, message: string) => void;
    onInfo?: (code: string, message: string) => void;
    onWebSocketOpen?: () => void;
    onWebSocketClose?: () => void;
    onWebSocketError?: () => void;
}
export declare class WebsocketAPI {
    private socket;
    private pingInterval;
    private reconnect;
    private apiKey?;
    private apiSecret?;
    private subaccount?;
    private onTrades?;
    private onTicker?;
    private onFill?;
    private onOrder?;
    private onPong?;
    private onFTXError?;
    private onFTXInfo?;
    private onWebSocketOpen?;
    private onWebSocketClose?;
    private onWebSocketError?;
    private pingIntervalID?;
    constructor(params: wsParameters);
    private initializeWebSocket;
    private onOpen;
    private onClose;
    private onError;
    private onMessage;
    login(): void;
    subscribePublic(ch: "trades" | "ticker", market: string): void;
    subscribePrivate(ch: "fills" | "orders"): void;
}
