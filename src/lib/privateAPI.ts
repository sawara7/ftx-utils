import * as crypto from 'crypto'
import {
    ApiConfig,
    BaseApiClass
} from './baseAPI'
import {
    CancelAllOrdersRequest,
    GetFillsRequest,
    GetFundingPaymentRequest,
    GetOrderHistoryRequest, 
    GetPositionsRequest, 
    PlaceOrderRequest, 
    WithdrawalRequest
} from './requestType'
import {
    Balance,
    FundingRatePayment,
    GetFillsResponse,
    GetOrderHistoryResponse,
    OpenOrder,
    PlaceOrderResponce,
    FTXResponse,
    Subaccount,
    WithdrawalResponse
} from './responseType'
import * as querystring from 'querystring'
import { PositionResponse } from '..'
import { sleep } from 'my-utils'

const BASE_URL = 'https://ftx.com'

export interface FTXPrivateApiConfig extends ApiConfig {
    apiKey: string;
    apiSecret: string;
    subAccount?: string;
    minOrderInterval?: number;
}

export class FTXPrivateApiClass extends BaseApiClass {
    private static toSha256(key: string, value: string): string {
        return crypto
            .createHmac('sha256', key)
            .update(Buffer.from(value))
            .digest('hex')
            .toString();
    }

    private readonly _apiKey: string;
    private readonly _apiSecret: string;
    private readonly _subAccount?: string;

    private static _lastOrderTime?: {[marketName: string]: number}
    private _minOrderInterval: number

    constructor(config: FTXPrivateApiConfig) {
        config.endPoint = config.endPoint || BASE_URL
        super(config)
        this._apiKey = config.apiKey
        this._apiSecret = config.apiSecret
        this._subAccount = config.subAccount
        this._minOrderInterval = config.minOrderInterval || 200
        if (!FTXPrivateApiClass._lastOrderTime){
            FTXPrivateApiClass._lastOrderTime = {}
        }
    }

    public getAllSubaccounts(): Promise<FTXResponse<Subaccount[]>> {
        const path = '/api/subaccounts'
        return this.get(path, {})
    }

    public getBalances(): Promise<FTXResponse<Balance[]>> {
        const path = '/api/wallet/balances'
        return this.get(path, {})
    }

    public getAllBalances(): Promise<FTXResponse<{[nickname: string] : Balance[]}>> {
        const path = '/api/wallet/all_balances'
        return this.get(path, {})
    }

    public getFundingPayment(params: GetFundingPaymentRequest): Promise<FTXResponse<FundingRatePayment[]>> {
        const path = '/api/funding_payments'
        return this.get(path, params)
    }

    public getOpenOrders(): Promise<FTXResponse<OpenOrder[]>> {
        const path = '/api/orders'
        return this.get(path, {})
    }

    public async placeOrder(params: PlaceOrderRequest): Promise<FTXResponse<PlaceOrderResponce>> {
        const path = '/api/orders'
        await this.sleepWhileOrderInterval(params.market)
        return await this.post(path, params)
    }

    public getFills(params: GetFillsRequest): Promise<FTXResponse<GetFillsResponse[]>> {
        const path = '/api/fills'
        return this.get(path, params)
    }

    public getOrderHistory(params: GetOrderHistoryRequest): Promise<FTXResponse<GetOrderHistoryResponse[]>> {
        const path = '/api/orders/history'
        return this.get(path, params)
    }

    public requestWithdrawal(params: WithdrawalRequest): Promise<FTXResponse<WithdrawalResponse>> {
        const path = '/api/wallet/withdrawals'
        return this.post(path, params)
    }

    public cancelAllOrder(params: CancelAllOrdersRequest): Promise<FTXResponse<string>> {
        const path = '/api/orders'
        return this.delete(path, params)
    }

    public cancelOrder(id: number): Promise<FTXResponse<string>> {
        const path = '/api/orders/' + id
        return this.delete(path, {})
    }

    public cancelOrderByClientID(id: string): Promise<FTXResponse<string>> {
        const path = '/api/orders/by_client_id/' + id
        return this.delete(path, {})
    }

    public getPositions(params: GetPositionsRequest): Promise<FTXResponse<PositionResponse[]>> {
        const path = '/api/positions'
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

    delete<T>(path: string, query?: {}) {
        let queryPath = path
        if (query && Object.keys(query).length > 0) {
            queryPath += '?' + querystring.encode(query)
        }
        return super.delete(queryPath, query, this.makeHeader('DELETE', queryPath))
    }

    private makeHeader(method: string, path: string, body: string = ''): any {
        const ts = Date.now()
        const s = ts + method + path + (method === 'POST'?  body: '')
        const sign = FTXPrivateApiClass.toSha256(this._apiSecret, s)
        const header = {
            'FTX-KEY': this._apiKey,
            'FTX-TS': ts.toString(),
            'FTX-SIGN': sign
        }
        if (this._subAccount) {
            Object.assign(header, {'FTX-SUBACCOUNT': this._subAccount})
        }
        return header
    }

    private async sleepWhileOrderInterval(market: string): Promise<void> {
        if (!FTXPrivateApiClass._lastOrderTime) {
            throw new Error('no last order')
        }
        if (FTXPrivateApiClass._lastOrderTime[market]) {
            const interval = Date.now() - FTXPrivateApiClass._lastOrderTime[market]
            if (interval > 0) {
                if (interval < this._minOrderInterval) {
                    FTXPrivateApiClass._lastOrderTime[market] += this._minOrderInterval 
                    await sleep(this._minOrderInterval - interval)
                } else if (interval > this._minOrderInterval) {
                    FTXPrivateApiClass._lastOrderTime[market] = Date.now()
                }
            } else if (interval < 0) {
                FTXPrivateApiClass._lastOrderTime[market] += this._minOrderInterval
                await sleep(FTXPrivateApiClass._lastOrderTime[market] - Date.now())
            }
        } else {
            FTXPrivateApiClass._lastOrderTime[market] = Date.now()
        }
    }
}

