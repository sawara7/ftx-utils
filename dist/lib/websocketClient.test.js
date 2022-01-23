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
const websocketClient_1 = require("./websocketClient");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const client = new websocketClient_1.WebsocketAPIClient({
        subscribeOrder: true,
        subaccount: "01_BOT_NAMPING",
        tickerSymbols: ["STEP-PERP"],
        onClientStart: () => { console.log("start"); },
        onClientError: () => (console.log("eeror")),
        onClientOrder: (order) => { console.log(order.id); },
        onClientTicker: (ticker) => { console.log(ticker.ask); }
    });
    client.Start();
}))();
