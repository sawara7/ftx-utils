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
var ws_1 = require("ws");
var crypto = __importStar(require("crypto"));
var WebsocketAPI = /** @class */ (function () {
    function WebsocketAPI() {
        this.socket = new ws_1.WebSocket('wss://ftx.com/ws/');
        this.socket.addEventListener('error', this.onError);
        this.socket.addEventListener('open', this.onOpen);
        this.socket.addEventListener('message', this.onMessage);
    }
    WebsocketAPI.prototype.onOpen = function () {
        var _this = this;
        this.socket.send(JSON.stringify({ 'op': 'ping' }));
        setInterval(function () {
            _this.socket.send(JSON.stringify({ 'op': 'ping' }));
        }, 15 * 1000);
    };
    WebsocketAPI.prototype.onError = function () {
        console.log('サーバーへの接続に失敗しました');
    };
    WebsocketAPI.prototype.onMessage = function (event) {
        var d = JSON.parse(event.data.toString());
        var t = d;
        if (t.channel === 'trades') {
            if (this.onTrades && t.data && t.data.length > 0) {
                this.onTrades(t.data);
            }
        }
        if (t.channel === 'ticker') {
            if (this.onTicker && t.data) {
                this.onTicker(t.data);
            }
        }
        if (t.channel === 'fills') {
            if (this.onFill && t.data) {
                this.onFill(t.data);
            }
        }
        if (t.channel === 'orders') {
            if (this.onOrder && t.data) {
                this.onOrder(t.data);
            }
        }
    };
    WebsocketAPI.prototype.login = function (apiKey, secret, subaccount) {
        var t = Date.now();
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
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
    };
    WebsocketAPI.prototype.subscribePublic = function (ch, market) {
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
            'channel': ch,
            'market': market
        }));
    };
    WebsocketAPI.prototype.subscribePricate = function (ch) {
        this.socket.send(JSON.stringify({
            'op': 'subscribe',
            'channel': ch
        }));
    };
    return WebsocketAPI;
}());
exports.WebsocketAPI = WebsocketAPI;
