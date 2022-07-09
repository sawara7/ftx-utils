import { BasePositionClass, BasePositionParameters } from "trade-utils";
import { FTXPrivateApiClass } from "..";
import { FTXOrderClass } from "./order";
export interface FTXPositionParameters extends BasePositionParameters {
    api: FTXPrivateApiClass;
}
export declare class FTXPositionClass extends BasePositionClass {
    private _api;
    constructor(params: FTXPositionParameters);
    private placeOrder;
    doOpen(): Promise<string>;
    doClose(): Promise<string>;
    doCancel(): Promise<void>;
    get openOrder(): FTXOrderClass;
    get closeOrder(): FTXOrderClass;
    get losscutOrder(): FTXOrderClass | undefined;
}
