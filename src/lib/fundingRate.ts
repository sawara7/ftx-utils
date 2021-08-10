import { FundingRatePayment } from ".."
import { getTimeStampKey, TimeSpan } from "firebase-utils-common"

export type FRPayment = number
export type FRPaymentByTime = {[time: string]: FRPayment}

export function calcTotalFundingRatePayments (
    payments: {[future: string]: FundingRatePayment},
    type: TimeSpan,
    digit?: number
    ): FRPaymentByTime {
    const result: FRPaymentByTime = {}
    for (const future in payments) {
        const pay = payments[future]
        const key = getTimeStampKey(pay.time, type)
        if (!result[key]) result[key] = 0
        result[key] += pay.payment
    }
    if (digit) {
        for (const key in result) {
            result[key] = Math.floor(result[key] * (10^digit))/(10^digit) 
        }
    }
    return result
}
