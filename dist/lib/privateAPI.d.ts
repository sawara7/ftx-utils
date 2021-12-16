import { BaseApiClass, BaseApiClassOptions, FTXApiConfig } from './baseAPI';
import { CancelAllOrdersRequest, GetFillsRequest, GetFundingPaymentRequest, GetOrderHistoryRequest, PlaceOrderRequest, WithdrawalRequest } from './requestType';
import { Balance, FundingRatePayment, GetFillsResponse, GetOrderHistoryResponse, OpenOrder, PlaceOrderResponce, Response, Subaccount, WithdrawalResponse } from './responseType';
export declare class PrivateApiClass extends BaseApiClass {
    private static toSha256;
    private readonly apiKey;
    private readonly apiSecret;
    private readonly subAccount?;
    constructor(config: FTXApiConfig, options?: BaseApiClassOptions);
    getAllSubaccounts(): Promise<Response<Subaccount[]>>;
    getBalances(): Promise<Response<Balance[]>>;
    getAllBalances(): Promise<Response<{
        [nickname: string]: Balance[];
    }>>;
    getFundingPayment(params: GetFundingPaymentRequest): Promise<Response<FundingRatePayment[]>>;
    getOpenOrders(): Promise<Response<OpenOrder[]>>;
    placeOrder(params: PlaceOrderRequest): Promise<Response<PlaceOrderResponce>>;
    getFills(params: GetFillsRequest): Promise<Response<GetFillsResponse[]>>;
    getOrderHistory(params: GetOrderHistoryRequest): Promise<Response<GetOrderHistoryResponse[]>>;
    requestWithdrawal(params: WithdrawalRequest): Promise<Response<WithdrawalResponse>>;
    cancelAllOrder(params: CancelAllOrdersRequest): Promise<Response<string>>;
    cancelOrder(id: number): Promise<Response<string>>;
    cancelOrderByClientID(id: string): Promise<Response<string>>;
    get<T>(path: string, query?: {}): Promise<any>;
    post<T>(path: string, body: {}): Promise<any>;
    delete<T>(path: string, query?: {}): Promise<any>;
    private makeHeader;
}
