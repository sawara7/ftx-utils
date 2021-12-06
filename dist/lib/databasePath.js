"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFundingRatePaymentPath = exports.getFundingRatePath = exports.getFuturePath = void 0;
var firebase_utils_common_1 = require("firebase-utils-common");
function getFuturePath(time, future) {
    return 'future/' + firebase_utils_common_1.getTimeStampKey(time, 'hour') + (future ? '/' + future : '');
}
exports.getFuturePath = getFuturePath;
function getFundingRatePath(time, future) {
    return 'fundingRate/' + (time ? '/' + firebase_utils_common_1.getTimeStampKey(time, 'hour') : '') + (future ? '/' + future : '');
}
exports.getFundingRatePath = getFundingRatePath;
function getFundingRatePaymentPath(time, account, future) {
    return 'fundingRatePayment/' + (time ? '/' + firebase_utils_common_1.getTimeStampKey(time, 'hour') : '') + (account && future ? '/' + account + '_' + future : '');
}
exports.getFundingRatePaymentPath = getFundingRatePaymentPath;
