import { 
    WebsocketAPI,
    wsFill,
    wsOrder,
    wsTicker,
    wsTrade
} from ".."

import {
    getRealTimeDatabase,
    sleep,
    timeBeforeMin
} from "my-utils"

import {
    SlackNotifier
} from "slack-notification"

export interface WebsocketAPIClientParams {
    notifier?: SlackNotifier,
    subscribeOrder: boolean,
    tickerSymbols: string[],
    subaccount: string,
    onClientStart?: ()=>void
    onClientError?: ()=>void
    onClientOrder?: (order: wsOrder)=>void
    onClientTicker?: (ticker: wsTicker)=> void
}

export class WebsocketAPIClient {
    private isError: boolean = false
    private apiKey?: string
    private apiSecret?: string
    private wsAPI?: WebsocketAPI
    private subaccount?: string
    private tickerSymbols: string[]
    private subscribeOrder: boolean = true
    private pongTime: number = 0
    private checkPongTimeProcID?: NodeJS.Timeout
    private notifier?: SlackNotifier
    private onClientStart?: ()=>void
    private onClientError?: ()=>void
    private onClientOrder?: (order: wsOrder)=>void
    private onClientTicker?: (ticker: wsTicker)=> void
    constructor(params: WebsocketAPIClientParams) {
        this.notifier = params.notifier
        this.subscribeOrder = params.subscribeOrder
        this.tickerSymbols = params.tickerSymbols
        this.subaccount = params.subaccount
        this.onClientStart = params.onClientStart 
        this.onClientError = params.onClientError
        this.onClientOrder = params.onClientOrder
        this.onClientTicker = params.onClientTicker
    }

    async Start() {
        const rdb = await getRealTimeDatabase()
        this.apiKey = await rdb.get(await rdb.getReference('settings/ftx/apiKey')) as string
        this.apiSecret = await rdb.get(await rdb.getReference('settings/ftx/apiSecret')) as string
        
        this.wsAPI = new WebsocketAPI({
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            subAccount: this.subaccount,
            pingIntervalSec: 5,
            reconnectOnClose: true,
            onPong: this.onPong,
            onFill: this.onFill,
            onOrder: this.onOrder,
            onTicker: this.onTicker,
            onError: this.onError,
            onInfo: this.onInfo,
            onWebSocketOpen: this.onWebSocketOpen,
            onWebSocketClose: this.onWebSocketClose,
            onWebSocketError: this.onWebSocketError
        })
        this.checkPongTimeProcID = setInterval(this.checkPongTime, 10 * 60 * 1000)
    }

    private checkPongTime = ()=> {
        if (this.pongTime < timeBeforeMin(5) && this.checkPongTimeProcID) {
            this.notifier?.sendMessage("Pong not coming.")
            clearInterval(this.checkPongTimeProcID)
            delete this.checkPongTimeProcID
        }
    }

    private onWebSocketOpen = async () => {
        this.notifier?.sendMessage("WebSocket Open")
        this.isError = false
        this.wsAPI?.login()
        await sleep(3000)
        if (!this.isError) {
            if (this.subscribeOrder) {
                this.wsAPI?.subscribePrivate("orders")
                for (const m of this.tickerSymbols) {
                    this.wsAPI?.subscribePublic("ticker", m)
                }
            }
            if (this.onClientStart) {
                this.onClientStart()
            }
        }else{
            if (this.onClientError) {
                this.onClientError()
            }
        }
    }

    private onWebSocketClose = async () => {
        this.notifier?.sendMessage("WebSocket Close")
    }

    private onWebSocketError = async () => {
        this.notifier?.sendMessage("WebSocket Error")
    }

    private onError = (code: string, message: string) => {
        this.notifier?.sendMessage("FTX:" + code + message)
        this.isError = true
    }

    private onInfo = (code: string, message: string) => {
        this.notifier?.sendMessage("FTX:" + code + message)
    }

    private onPong = ()=> {
        this.pongTime = Date.now()
    }

    private onFill = (fill: wsFill)=> {
    }

    private onOrder = (order: wsOrder)=> {
        if (this.onClientOrder) {
            this.onClientOrder(order)
        }
    }

    private onTicker = (ticker: wsTicker) => {
        if (this.onClientTicker) {
            this.onClientTicker(ticker)
        }
    }
}