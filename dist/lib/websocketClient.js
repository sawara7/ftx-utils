"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketAPIClient = void 0;
const __1 = require("..");
const my_utils_1 = require("my-utils");
class WebsocketAPIClient {
    constructor(params) {
        this.isError = false;
        this.subscribeOrder = true;
        this.pongTime = 0;
        this.checkPongTime = () => {
            var _a;
            if (this.pongTime < (0, my_utils_1.timeBeforeMin)(5) && this.checkPongTimeProcID) {
                (_a = this.notifier) === null || _a === void 0 ? void 0 : _a.sendMessage("Pong not coming.");
                clearInterval(this.checkPongTimeProcID);
                delete this.checkPongTimeProcID;
            }
        };
        this.onWebSocketOpen = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            (_a = this.notifier) === null || _a === void 0 ? void 0 : _a.sendMessage("WebSocket Open");
            this.isError = false;
            (_b = this.wsAPI) === null || _b === void 0 ? void 0 : _b.login();
            yield (0, my_utils_1.sleep)(3000);
            if (!this.isError) {
                if (this.subscribeOrder) {
                    (_c = this.wsAPI) === null || _c === void 0 ? void 0 : _c.subscribePrivate("orders");
                    for (const m of this.tickerSymbols) {
                        (_d = this.wsAPI) === null || _d === void 0 ? void 0 : _d.subscribePublic("ticker", m);
                    }
                }
                if (this.onClientStart) {
                    this.onClientStart();
                }
            }
            else {
                if (this.onClientError) {
                    this.onClientError();
                }
            }
        });
        this.onWebSocketClose = () => __awaiter(this, void 0, void 0, function* () {
            var _e;
            (_e = this.notifier) === null || _e === void 0 ? void 0 : _e.sendMessage("WebSocket Close");
        });
        this.onWebSocketError = () => __awaiter(this, void 0, void 0, function* () {
            var _f;
            (_f = this.notifier) === null || _f === void 0 ? void 0 : _f.sendMessage("WebSocket Error");
        });
        this.onError = (code, message) => {
            var _a;
            (_a = this.notifier) === null || _a === void 0 ? void 0 : _a.sendMessage("FTX:" + code + message);
            this.isError = true;
        };
        this.onInfo = (code, message) => {
            var _a;
            (_a = this.notifier) === null || _a === void 0 ? void 0 : _a.sendMessage("FTX:" + code + message);
        };
        this.onPong = () => {
            this.pongTime = Date.now();
        };
        this.onFill = (fill) => {
        };
        this.onOrder = (order) => {
            if (this.onClientOrder) {
                this.onClientOrder(order);
            }
        };
        this.onTicker = (ticker) => {
            if (this.onClientTicker) {
                this.onClientTicker(ticker);
            }
        };
        this.notifier = params.notifier;
        this.subscribeOrder = params.subscribeOrder;
        this.tickerSymbols = params.tickerSymbols;
        this.subaccount = params.apiSettings.subAccount;
        this.apiKey = params.apiSettings.apiKey;
        this.apiSecret = params.apiSettings.apiSecret;
        this.onClientStart = params.onClientStart;
        this.onClientError = params.onClientError;
        this.onClientOrder = params.onClientOrder;
        this.onClientTicker = params.onClientTicker;
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.wsAPI = new __1.WebsocketAPI({
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
            });
            this.checkPongTimeProcID = setInterval(this.checkPongTime, 10 * 60 * 1000);
        });
    }
}
exports.WebsocketAPIClient = WebsocketAPIClient;
