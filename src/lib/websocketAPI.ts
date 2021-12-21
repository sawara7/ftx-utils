import { WebSocket, MessageEvent } from 'ws'
import * as crypto from 'crypto'
interface wsResponse<T> {
    channel: string;
    market: string;
    type: string;
    data?: T;
    code?: string;
    msg?: string;
}

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
    fee: number //78.05799225,
    feeRate: number //0.0014,
    future: string //BTC-PERP,
    id: number //7828307,
    liquidity: string //taker,
    market: string //BTC-PERP,
    orderId: number //38065410,
    tradeId: number //19129310,
    price: number //3723.75,
    side: string //buy,
    size: number //14.973,
    time: string //2019-05-07T16:40:58.358438+00:00,
    type: string //order
}

export interface wsOrder {
    id: number //24852229,
    clientId?: string //null,
    market: string //XRP-PERP,
    type: string //limit,
    side: string //buy,
    size: number //42353.0,
    price: number //0.2977,
    reduceOnly: boolean //false,
    ioc: boolean //false,
    postOnly: boolean //false,
    status: string //closed,
    filledSize: number //0.0,
    remainingSize: number //0.0,
    avgFillPrice: number //0.2978
}

export interface wsParameters {
    pingIntervalSec?: number
    reconnectOnClose?: boolean
}
export class WebsocketAPI {
    private socket: WebSocket
    private pingInterval: number
    private reconnect: boolean
    // FTX Events
    public onTrades?: (trades: wsTrade[]) => void
    public onTicker?: (ticer: wsTicker) => void
    public onFill?: (fill: wsFill) => void
    public onOrder?:(orders: wsOrder) => void
    public onPong?: () => void
    // WebSocket Events
    public onWebSocketOpen?: () => void
    public onWebSocketClose?: () => void
    public onWebSocketError?: () => void
    // internal
    private pingIntervalID?: NodeJS.Timeout

    constructor(params: wsParameters) {
        this.socket = new WebSocket('wss://ftx.com/ws/')
        this.pingInterval = (params.pingIntervalSec || 5) * 1000
        this.reconnect = params.reconnectOnClose || false
        this.initializeWebSocket()
    }

    private initializeWebSocket() {
        if (this.pingIntervalID) {
            clearInterval(this.pingIntervalID)
        }
        this.socket.addEventListener('error', this.onError)
        this.socket.addEventListener('open', this.onOpen)
        this.socket.addEventListener('message', this.onMessage)
        this.socket.addEventListener('close', this.onClose)
    }

    private onOpen = () => {
        this.pingIntervalID = setInterval(() => {
            this.socket.send(JSON.stringify({'op': 'ping'}))
        },  this.pingInterval)
        if (this.onWebSocketOpen){
            this.onWebSocketOpen()
        }
    }

    private onClose = () => {
        if (this.reconnect) {
            this.socket = new WebSocket('wss://ftx.com/ws/')
            this.initializeWebSocket()
        }
        if (this.onWebSocketClose){
            this.onWebSocketClose()
        }
    }

    private onError = () => {
        if (this.onWebSocketError){
            this.onWebSocketError()
        }
    }

    private onMessage = (event: MessageEvent) => {
        const d = JSON.parse(event.data.toString())
        const t = d as wsResponse<any>
        if (t.channel === 'trades') {
            if (this.onTrades && t.data && t.data.length > 0) {
                this.onTrades(t.data as wsTrade[])
            }
        }else if (t.channel === 'ticker') {
            if (this.onTicker && t.data) {
                this.onTicker(t.data as wsTicker)
            }
        }else if (t.channel === 'fills') {
            if (this.onFill && t.data) {
                this.onFill(t.data as wsFill)
            }
        }else if (t.channel === 'orders') {
            if (this.onOrder && t.data) {
                this.onOrder(t.data as wsOrder)
            }
        }else if (t.type === 'pong') {
            if (this.onPong) {
                this.onPong()
            }
        }else{
            console.log(event.data)
        }
    }

    public login(apiKey:string, secret: string, subaccount: string) {
        const t = Date.now()
        this.socket.send(JSON.stringify({
            'op': 'login',
            'args': {
                'key': apiKey,
                'sign': crypto
                    .createHmac('sha256', secret)
                    .update(Buffer.from(t+'websocket_login'))
                    .digest('hex')
                    .toString(),
                'time': t,
                'subaccount': subaccount
            }
        }))
    }

    public subscribePublic(ch: "trades" | "ticker", market: string) {
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
            'channel': ch,
            'market': market
        }))
    }

    public subscribePrivate(ch: "fills" | "orders") {
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
            'channel': ch
        }))
    }
}