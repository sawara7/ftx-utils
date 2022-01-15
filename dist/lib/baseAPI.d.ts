import { Method } from 'axios';
import { RESTTradeAPI } from 'my-utils';
export declare const FTX_API_NAME = "ftx";
export interface ApiConfig {
    endPoint?: string;
    keepAlive?: boolean;
    timeout?: number;
}
export interface FTXApiConfig extends ApiConfig {
    apiKey: string;
    apiSecret: string;
    subAccount?: string;
}
export interface BaseApiClassOptions {
    optionsCallback?: Function;
    responseCallback?: Function;
}
export declare class ApiError extends Error {
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
    constructor(config: ApiConfig, options?: BaseApiClassOptions);
    get(path: string, params?: {}, headers?: {}): Promise<any>;
    post(path: string, data?: {}, headers?: {}): Promise<any>;
    put(path: string, data?: {}, headers?: {}): Promise<any>;
    delete(path: string, params?: {}, headers?: {}): Promise<any>;
    request(method: Method, path: string, params?: {}, data?: {}, headers?: {}): Promise<any>;
}
