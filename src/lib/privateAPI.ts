import * as crypto from 'crypto'
import {
    BaseApiClass,
    BaseApiClassOptions,
    FTXApiConfig
} from './baseAPI'
import {
    GetFillsRequest,
    GetFundingPaymentRequest, GetOrderHistoryRequest, PlaceOrderRequest, WithdrawalRequest
} from './requestType'
import {
    Balance,
    FundingRatePayment,
    GetFillsResponse,
    GetOrderHistoryResponse,
    OpenOrder,
    PlaceOrderResponce,
    Response,
    Subaccount,
    WithdrawalResponse
} from './responseType'
import * as querystring from 'querystring'

const BASE_URL = 'https://ftx.com';
export class PrivateApiClass extends BaseApiClass {
    private static toSha256(key: string, value: string): string {
        return crypto
            .createHmac('sha256', key)
            .update(Buffer.from(value))
            .digest('hex')
            .toString();
    }

    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly subAccount?: string;

    constructor(config: FTXApiConfig, options?: BaseApiClassOptions) {
        config.endPoint = config.endPoint || BASE_URL;
        super(config, options);
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
        this.subAccount = config.subAccount;
    }

    public getAllSubaccounts(): Promise<Response<Subaccount[]>> {
        const path = '/api/subaccounts'
        return this.get(path, {})
    }

    public getBalances(): Promise<Response<Balance[]>> {
        const path = '/api/wallet/balances'
        return this.get(path, {})
    }

    public getAllBalances(): Promise<Response<{[nickname: string] : Balance[]}>> {
        const path = '/api/wallet/all_balances'
        return this.get(path, {})
    }

    public getFundingPayment(params: GetFundingPaymentRequest): Promise<Response<FundingRatePayment[]>> {
        const path = '/api/funding_payments'
        return this.get(path, params)
    }

    public getOpenOrders(): Promise<Response<OpenOrder[]>> {
        const path = '/api/orders'
        return this.get(path, {})
    }

    public placeOrder(params: PlaceOrderRequest): Promise<Response<PlaceOrderResponce>> {
        const path = '/api/orders'
        return this.post(path, params)
    }

    public getFills(params: GetFillsRequest): Promise<Response<GetFillsResponse[]>> {
        const path = '/api/fills'
        return this.get(path, params)
    }

    public getOrderHistory(params: GetOrderHistoryRequest): Promise<Response<GetOrderHistoryResponse[]>> {
        const path = '/api/orders/history'
        return this.get(path, params)
    }

    public requestWithdrawal(params: WithdrawalRequest): Promise<Response<WithdrawalResponse>> {
        const path = '/api/wallet/withdrawals'
        return this.get(path, params)
    }

    get<T>(path: string, query?: {}) {
        let queryPath = path
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query)
        }
        return super.get(queryPath, query, this.makeHeader('GET', queryPath))
    }

    post<T>(path: string, body: {}) {
        return super.post(path, body, this.makeHeader('POST', path, JSON.stringify(body)))
    }

    private makeHeader(method: string, path: string, body: string = ''): any {
        const ts = Date.now()
        const sign = PrivateApiClass.toSha256(this.apiSecret, ts + method + path + body)
        const header = {
            'FTX-KEY': this.apiKey,
            'FTX-TS': ts.toString(),
            'FTX-SIGN': sign
        }
        if (this.subAccount) {
            Object.assign(header, {'FTX-SUBACCOUNT': this.subAccount})
        }
        return header
    }
}

