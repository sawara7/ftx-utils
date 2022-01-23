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
const my_utils_1 = require("my-utils");
const __1 = require("..");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const rdb = yield (0, my_utils_1.getRealTimeDatabase)();
    const apiKey = yield rdb.get(yield rdb.getReference('settings/ftx/apiKey'));
    const secret = yield rdb.get(yield rdb.getReference('settings/ftx/apiSecret'));
    let flg = false;
    const wsAPI = new __1.WebsocketAPI({
        apiKey: apiKey,
        apiSecret: secret,
        subAccount: '01_BONAMPING',
        onWebSocketOpen: () => {
            wsAPI.login();
        },
        onError: (code, message) => {
            console.log(code, message);
            flg = true;
        }
    });
    yield (0, my_utils_1.sleep)(1000);
    if (flg) {
        console.log('Failed login');
    }
}))();
