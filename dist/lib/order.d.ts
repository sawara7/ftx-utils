import { BaseOrderSettings, BaseOrderClass } from "trade-utils";
import { PlaceOrderRequest } from "..";
export interface FTXOrderSettings extends BaseOrderSettings {
    reduceOnly?: boolean;
    ioc?: boolean;
    clientId?: string;
}
export declare class FTXOrderClass extends BaseOrderClass {
    private _reduceOnly;
    private _ioc;
    private _clientID;
    constructor(params: FTXOrderSettings);
    get limitOrderRequest(): PlaceOrderRequest;
}
