import { BaseOrderSettings, BaseOrderClass } from "trade-utils";
import { PlaceOrderRequest } from "..";
export interface FTXOrderSettings extends BaseOrderSettings {
    reduceOnly?: boolean;
    ioc?: boolean;
}
export declare class FTXOrderClass extends BaseOrderClass {
    private _reduceOnly;
    private _ioc;
    constructor(params: FTXOrderSettings);
    get OrderRequest(): PlaceOrderRequest;
}
