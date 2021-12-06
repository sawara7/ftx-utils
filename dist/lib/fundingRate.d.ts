import { FundingRatePayment } from "..";
import { TimeSpan } from "firebase-utils-common";
export declare function calcTotalFundingRatePayments(payments: {
    [future: string]: FundingRatePayment;
}, type: TimeSpan, digit?: number): {
    [time: string]: number;
};
