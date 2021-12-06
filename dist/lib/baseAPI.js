"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApiClass = exports.ApiError = exports.FTX_API_NAME = void 0;
var axios_1 = __importDefault(require("axios"));
exports.FTX_API_NAME = 'ftx';
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(code, message, data) {
        var _this = _super.call(this, 'API_ERROR') || this;
        _this.code = 0;
        _this.message = '';
        _this.code = code;
        _this.message = message;
        _this.data = data;
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
var BaseApiClass = /** @class */ (function () {
    function BaseApiClass(config, options) {
        this.endPoint = config.endPoint || "";
        this.keepAlive = config.keepAlive || false;
        this.timeout = config.timeout || 3000;
        if (options) {
            this.optionsCallback = options.optionsCallback;
            this.responseCallback = options.responseCallback;
        }
    }
    BaseApiClass.prototype.get = function (path, params, headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('GET', path, params, undefined, headers)];
            });
        });
    };
    BaseApiClass.prototype.post = function (path, data, headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('POST', path, undefined, data, headers)];
            });
        });
    };
    BaseApiClass.prototype.put = function (path, data, headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('PUT', path, undefined, data, headers)];
            });
        });
    };
    BaseApiClass.prototype.delete = function (path, params, headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('DELETE', path, params, undefined, headers)];
            });
        });
    };
    BaseApiClass.prototype.request = function (method, path, params, data, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var queryPath, options, res, e_1, err, code, message, data_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryPath = path;
                        options = {
                            method: method,
                            baseURL: this.endPoint,
                            url: queryPath,
                            timeout: this.timeout
                            // httpAgent: new http.Agent({ keepAlive: this.keepAlive }),
                            // httpsAgent: new https.Agent({ keepAlive: this.keepAlive })
                        };
                        if (data && Object.keys(data).length >= 0) {
                            Object.assign(options, { data: data });
                        }
                        if (headers && Object.keys(headers).length > 0) {
                            Object.assign(options, { headers: headers });
                        }
                        if (!this.optionsCallback) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.optionsCallback(options)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.request(options)];
                    case 3:
                        res = _a.sent();
                        if (this.responseCallback) {
                            this.responseCallback(res.data);
                        }
                        return [2 /*return*/, res.data];
                    case 4:
                        e_1 = _a.sent();
                        err = e_1;
                        code = 0;
                        message = err.message;
                        if (err.response) {
                            code = err.response.status;
                            data_1 = err.response.data;
                        }
                        throw new ApiError(code, message, data_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return BaseApiClass;
}());
exports.BaseApiClass = BaseApiClass;
