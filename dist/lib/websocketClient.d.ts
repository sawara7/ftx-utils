import { FTXPrivateApiConfig, wsOrder, wsTicker } from "..";
export interface WebsocketAPIClientParams {
    apiSettings: FTXPrivateApiConfig;
    subscribeOrder: boolean;
    tickerSymbols: string[];
    onClientStart?: () => void;
    onClientError?: () => void;
    onClientOrder?: (order: wsOrder) => void;
    onClientTicker?: (ticker: wsTicker) => void;
}
export declare class WebsocketAPIClient {
    private isError;
    private apiKey?;
    private apiSecret?;
    private wsAPI?;
    private subaccount?;
    private tickerSymbols;
    private subscribeOrder;
    private pongTime;
    private checkPongTimeProcID?;
    private onClientStart?;
    private onClientError?;
    private onClientOrder?;
    private onClientTicker?;
    constructor(params: WebsocketAPIClientParams);
    Start(): Promise<void>;
    private checkPongTime;
    private onWebSocketOpen;
    private onWebSocketClose;
    private onWebSocketError;
    private onError;
    private onInfo;
    private onPong;
    private onFill;
    private onOrder;
    private onTicker;
}
