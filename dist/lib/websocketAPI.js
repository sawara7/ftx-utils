"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketAPI = void 0;
const ws_1 = require("ws");
const crypto = __importStar(require("crypto"));
class WebsocketAPI {
    constructor() {
        this.onOpen = () => {
            this.socket.send(JSON.stringify({ 'op': 'ping' }));
            setInterval(() => {
                this.socket.send(JSON.stringify({ 'op': 'ping' }));
            }, 5 * 1000);
        };
        this.onError = () => {
            console.log('サーバーへの接続に失敗しました');
        };
        this.onMessage = (event) => {
            const d = JSON.parse(event.data.toString());
            const t = d;
            if (t.channel === 'trades') {
                if (this.onTrades && t.data && t.data.length > 0) {
                    this.onTrades(t.data);
                }
            }
            else if (t.channel === 'ticker') {
                if (this.onTicker && t.data) {
                    this.onTicker(t.data);
                }
            }
            else if (t.channel === 'fills') {
                if (this.onFill && t.data) {
                    this.onFill(t.data);
                }
            }
            else if (t.channel === 'orders') {
                if (this.onOrder && t.data) {
                    this.onOrder(t.data);
                }
            }
            else if (t.channel === 'pong') {
                console.log(event.data);
            }
            else {
                console.log(event.data);
            }
        };
        this.socket = new ws_1.WebSocket('wss://ftx.com/ws/');
        this.socket.addEventListener('error', this.onError);
        this.socket.addEventListener('open', this.onOpen);
        this.socket.addEventListener('message', this.onMessage);
    }
    login(apiKey, secret, subaccount) {
        const t = Date.now();
        this.socket.send(JSON.stringify({
            'op': 'login',
            'args': {
                'key': apiKey,
                'sign': crypto
                    .createHmac('sha256', secret)
                    .update(Buffer.from(t + 'websocket_login'))
                    .digest('hex')
                    .toString(),
                'time': t,
                'subaccount': subaccount
            }
        }));
    }
    subscribePublic(ch, market) {
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
            'channel': ch,
            'market': market
        }));
    }
    subscribePricate(ch) {
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
            'channel': ch
        }));
    }
}
exports.WebsocketAPI = WebsocketAPI;
