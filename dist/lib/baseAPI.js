"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApiClass = exports.ApiError = exports.FTX_API_NAME = void 0;
const axios_1 = __importDefault(require("axios"));
const my_utils_1 = require("my-utils");
exports.FTX_API_NAME = 'ftx';
class ApiError extends Error {
    constructor(code, message, data) {
        super('API_ERROR');
        this.code = 0;
        this.message = '';
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
exports.ApiError = ApiError;
class BaseApiClass extends my_utils_1.RESTTradeAPI {
    constructor(config, options) {
        super();
        this.endPoint = config.endPoint || "";
        this.keepAlive = config.keepAlive || false;
        this.timeout = config.timeout || 3000;
        if (options) {
            this.optionsCallback = options.optionsCallback;
            this.responseCallback = options.responseCallback;
        }
    }
    get(path, params, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', path, params, undefined, headers);
        });
    }
    post(path, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', path, undefined, data, headers);
        });
    }
    put(path, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', path, undefined, data, headers);
        });
    }
    delete(path, params, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', path, params, undefined, headers);
        });
    }
    request(method, path, params, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryPath = path;
            const options = {
                method: method,
                baseURL: this.endPoint,
                url: queryPath,
                timeout: this.timeout
                // httpAgent: new http.Agent({ keepAlive: this.keepAlive }),
                // httpsAgent: new https.Agent({ keepAlive: this.keepAlive })
            };
            if (data && Object.keys(data).length >= 0) {
                Object.assign(options, { data });
            }
            if (headers && Object.keys(headers).length > 0) {
                Object.assign(options, { headers });
            }
            if (this.optionsCallback) {
                yield this.optionsCallback(options);
            }
            try {
                const res = yield axios_1.default.request(options);
                if (this.responseCallback) {
                    this.responseCallback(res.data);
                }
                return res.data;
            }
            catch (e) {
                const err = e;
                let code = 0;
                let message = err.message;
                let data;
                if (err.response) {
                    code = err.response.status;
                    data = err.response.data;
                }
                throw new ApiError(code, message, data);
            }
        });
    }
}
exports.BaseApiClass = BaseApiClass;
