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
exports.querysToapi = void 0;
const axios_1 = __importDefault(require("axios"));
class QuerysToAPI {
    constructor() {
        this.user = {
            username: 'Lucasc12',
            password: 'Salmeron1-',
        };
        this.token = '';
        this.hash = '';
        this.imageUrl = '';
        this.baseURL = '';
        this.data = [];
        this.config = {
            headers: {
                authorization: '',
            },
        };
        this.session = false;
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios_1.default.post('https://api.mangadex.org/auth/login', this.user).then((res) => this.token = `${res.data.token.session}`).catch((err) => console.log(err.response.data));
            if (this.config.headers !== undefined) {
                this.config.headers.authorization = `bearer ${this.token}`;
                return true;
            }
            return false;
        });
    }
    checkSession() {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios_1.default.get('https://api.mangadex.org/auth/check', this.config).then((res) => { if (res.data.isAuthenticated) {
                this.session = true;
            } });
        });
    }
    URL(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session) {
                yield axios_1.default.get(`https://api.mangadex.org/at-home/server/${id}`, this.config).then((res) => { this.baseURL = res.data.baseUrl; this.hash = res.data.chapter.hash; this.data = res.data.chapter.data; });
                console.log(this.data);
                return this.data;
            }
            yield axios_1.default.get(`https://api.mangadex.org/at-home/server/${id}`, this.config).then((res) => { this.baseURL = res.data.baseUrl; this.hash = res.data.chapter.hash; this.data = res.data.chapter.data; });
            console.log(this.data);
            return this.data;
        });
    }
    getIMAGE(image) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios_1.default.get(`${this.baseURL}/data/${this.hash}/${image}`, this.config).then((res) => { if (res.config.url) {
                this.imageUrl = res.config.url;
            }
            else {
                console.log('no url');
            } });
            return this.imageUrl;
        });
    }
}
exports.querysToapi = new QuerysToAPI();
