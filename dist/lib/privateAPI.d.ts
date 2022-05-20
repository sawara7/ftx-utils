import { ApiConfig, BaseApiClass } from './baseAPI';
import { CancelAllOrdersRequest, GetFillsRequest, GetFundingPaymentRequest, GetOrderHistoryRequest, GetPositionsRequest, PlaceOrderRequest, WithdrawalRequest } from './requestType';
import { Balance, FundingRatePayment, GetFillsResponse, GetOrderHistoryResponse, OpenOrder, PlaceOrderResponce, FTXResponse, Subaccount, WithdrawalResponse } from './responseType';
import { PositionResponse } from '..';
export interface FTXPrivateApiConfig extends ApiConfig {
    apiKey: string;
    apiSecret: string;
    subAccount?: string;
    minOrderInterval?: number;
}
export declare class FTXPrivateApiClass extends BaseApiClass {
    private static toSha256;
    private readonly _apiKey;
    private readonly _apiSecret;
    private readonly _subAccount?;
    private static _lastOrderTime?;
    private _minOrderInterval;
    constructor(config: FTXPrivateApiConfig);
    getAllSubaccounts(): Promise<FTXResponse<Subaccount[]>>;
    getBalances(): Promise<FTXResponse<Balance[]>>;
    getAllBalances(): Promise<FTXResponse<{
        [nickname: string]: Balance[];
    }>>;
    getFundingPayment(params: GetFundingPaymentRequest): Promise<FTXResponse<FundingRatePayment[]>>;
    getOpenOrders(): Promise<FTXResponse<OpenOrder[]>>;
    placeOrder(params: PlaceOrderRequest): Promise<FTXResponse<PlaceOrderResponce>>;
    getFills(params: GetFillsRequest): Promise<FTXResponse<GetFillsResponse[]>>;
    getOrderHistory(params: GetOrderHistoryRequest): Promise<FTXResponse<GetOrderHistoryResponse[]>>;
    requestWithdrawal(params: WithdrawalRequest): Promise<FTXResponse<WithdrawalResponse>>;
    cancelAllOrder(params: CancelAllOrdersRequest): Promise<FTXResponse<string>>;
    cancelOrder(id: number): Promise<FTXResponse<string>>;
    cancelOrderByClientID(id: string): Promise<FTXResponse<string>>;
    getPositions(params: GetPositionsRequest): Promise<FTXResponse<PositionResponse[]>>;
    get<T>(path: string, query?: {}): Promise<any>;
    post<T>(path: string, body: {}): Promise<any>;
    delete<T>(path: string, query?: {}): Promise<any>;
    private makeHeader;
    private sleepWhileOrderInterval;
}
