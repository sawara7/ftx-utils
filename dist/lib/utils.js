"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
function sleep(waitSec) {
    return new Promise(function (resolve) {
        setTimeout(function () { resolve(); }, waitSec);
    });
}
exports.sleep = sleep;
