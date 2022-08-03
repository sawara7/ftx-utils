import { 
    FTXPrivateApiConfig,
    WebsocketAPI,
    wsFill,
    wsOrder,
    wsTicker
} from ".."
import { sleep, timeBeforeMin } from "my-utils"

export interface WebsocketAPIClientParams {
    apiSettings: FTXPrivateApiConfig,
    subscribeOrder: boolean,
    tickerSymbols: string[],
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
    private onClientStart?: ()=>void
    private onClientError?: ()=>void
    private onClientOrder?: (order: wsOrder)=>void
    private onClientTicker?: (ticker: wsTicker)=> void
    constructor(params: WebsocketAPIClientParams) {
        this.subscribeOrder = params.subscribeOrder
        this.tickerSymbols = params.tickerSymbols
        this.subaccount = params.apiSettings.subAccount
        this.apiKey = params.apiSettings.apiKey
        this.apiSecret = params.apiSettings.apiSecret
        this.onClientStart = params.onClientStart 
        this.onClientError = params.onClientError
        this.onClientOrder = params.onClientOrder
        this.onClientTicker = params.onClientTicker
    }

    async Start() {
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
            clearInterval(this.checkPongTimeProcID)
            delete this.checkPongTimeProcID
        }
    }

    private onWebSocketOpen = async () => {
        this.isError = false
        this.wsAPI?.login()
        await sleep(3000)
        if (!this.isError) {
            if (this.subscribeOrder) {
                this.wsAPI?.subscribePrivate("orders")
            }
            for (const m of this.tickerSymbols) {
                this.wsAPI?.subscribePublic("ticker", m)
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
    }

    private onWebSocketError = async () => {
    }

    private onError = (code: string, message: string) => {
        this.isError = true
    }

    private onInfo = (code: string, message: string) => {
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