import { getTimeStampKey } from "firebase-utils-common"

export function getFuturePath(time: string | number | Date, future?: string): string {
    return 'future/' + getTimeStampKey(time, 'hour') + (future? '/' + future : '')
}

export function getFundingRatePath(time?: string | number | Date, future?: string): string {
    return 'fundingRate/' + (time? '/' + getTimeStampKey(time, 'hour') : '') + (future? '/' + future : '')
}

export function getFundingRatePaymentPath(time?: string | number | Date, account?: string, future?: string): string {
    return 'fundingRatePayment/' + (time? '/' + getTimeStampKey(time, 'hour') : '')  + (account && future ? '/' + account + '_' + future : '')
}
