import { wsOrder, wsTicker } from "..";
import { SlackNotifier } from "slack-notification";
export interface WebsocketAPIClientParams {
    notifier?: SlackNotifier;
    subscribeOrder: boolean;
    tickerSymbols: string[];
    subaccount: string;
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
    private notifier?;
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
