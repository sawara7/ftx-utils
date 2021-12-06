"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcTotalFundingRatePayments = void 0;
var firebase_utils_common_1 = require("firebase-utils-common");
function calcTotalFundingRatePayments(payments, type, digit) {
    var result = {};
    for (var future in payments) {
        var pay = payments[future];
        var key = firebase_utils_common_1.getTimeStampKey(pay.time, type);
        if (!result[key])
            result[key] = 0;
        result[key] += pay.payment;
    }
    if (digit) {
        for (var key in result) {
            result[key] = Math.floor(result[key] * (10 ^ digit)) / (10 ^ digit);
        }
    }
    return result;
}
exports.calcTotalFundingRatePayments = calcTotalFundingRatePayments;
