import { BaseApiClass, BaseApiClassOptions, FTXApiConfig } from './baseAPI';
import { CancelAllOrdersRequest, GetFillsRequest, GetFundingPaymentRequest, GetOrderHistoryRequest, PlaceOrderRequest, WithdrawalRequest } from './requestType';
import { Balance, FundingRatePayment, GetFillsResponse, GetOrderHistoryResponse, OpenOrder, PlaceOrderResponce, FTXResponse, Subaccount, WithdrawalResponse } from './responseType';
export declare class PrivateApiClass extends BaseApiClass {
    private static toSha256;
    private readonly apiKey;
    private readonly apiSecret;
    private readonly subAccount?;
    constructor(config: FTXApiConfig, options?: BaseApiClassOptions);
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
    get<T>(path: string, query?: {}): Promise<any>;
    post<T>(path: string, body: {}): Promise<any>;
    delete<T>(path: string, query?: {}): Promise<any>;
    private makeHeader;
}
