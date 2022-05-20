import { Method } from 'axios';
import { RESTTradeAPI } from 'my-utils';
export declare const FTX_API_NAME = "ftx";
export interface ApiConfig {
    endPoint?: string;
    keepAlive?: boolean;
    timeout?: number;
    optionsCallback?: Function;
    responseCallback?: Function;
}
export declare class FTXApiError extends Error {
    code: number;
    message: string;
    data: any;
    constructor(code: number, message: string, data?: any);
}
export declare class BaseApiClass extends RESTTradeAPI {
    readonly endPoint: string;
    readonly keepAlive: boolean;
    readonly timeout: number;
    readonly optionsCallback?: Function;
    readonly responseCallback?: Function;
    constructor(config: ApiConfig);
    get(path: string, params?: {}, headers?: {}): Promise<any>;
    post(path: string, data?: {}, headers?: {}): Promise<any>;
    put(path: string, data?: {}, headers?: {}): Promise<any>;
    delete(path: string, params?: {}, headers?: {}): Promise<any>;
    request(method: Method, path: string, params?: {}, data?: {}, headers?: {}): Promise<any>;
}
