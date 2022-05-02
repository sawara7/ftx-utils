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
const __1 = require("..");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const api = yield (0, __1.getFTXPrivateAPI)('FTT');
    const res = yield api.getPositions({});
    if (res.success && res.result) {
        for (const pos of res.result) {
            console.log(pos);
            if (pos.future === 'FTT-PERP') {
                const closeSide = pos.side === 'buy' ? 'sell' : 'buy';
                yield api.placeOrder({
                    market: pos.future,
                    side: closeSide,
                    type: "market",
                    size: pos.openSize,
                    price: 0
                });
            }
        }
    }
    yield api.cancelAllOrder({ market: 'FTT-PERP' });
}))();
