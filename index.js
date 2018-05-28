"use strict";
/**
 * Created by user on 2018/5/28/028.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const defaultsDeep = require("defaults-deep");
const Promise = require("bluebird");
const events_returnvalue_1 = require("events-returnvalue");
const urlLib = require("url");
const popsicle = require("popsicle");
class ClientRequest extends events_returnvalue_1.default {
    constructor(token, options = {}, thisArgv) {
        super();
        this.token = token;
        this.options = Object.assign({}, options || {});
        this.thisArgv = thisArgv || null;
        if (this.options.apiRoot) {
            this.apiRoot = this.options.apiRoot;
        }
        /*
        {
            // @ts-ignore
            const old = this.token.client.request;

            // @ts-ignore
            this.token.client.request = function (method: string, url: string, body, headers)
            {
                return request(method, url, body, headers);
            };

            // @ts-ignore
            this.token.client._request = function (options: IRequestOptions)
            {

            };
        }
        */
    }
    get(url, requestOptions, options = {}, thisArgv) {
        return this._fetchMethod('GET', url, requestOptions, options, thisArgv);
    }
    post(url, requestOptions, options = {}, thisArgv) {
        return this._fetchMethod('POST', url, requestOptions, options, thisArgv);
    }
    put(url, requestOptions, options = {}, thisArgv) {
        return this._fetchMethod('PUT', url, requestOptions, options, thisArgv);
    }
    delete(url, requestOptions, options = {}, thisArgv) {
        return this._fetchMethod('DELETE', url, requestOptions, options, thisArgv);
    }
    patch(url, requestOptions, options = {}, thisArgv) {
        return this._fetchMethod('PATCH', url, requestOptions, options, thisArgv);
    }
    sign(url, requestOptions) {
        requestOptions = this.token.sign(Object.assign({}, requestOptions, { url }));
        return requestOptions;
    }
    fetchSign(url, requestOptions, options = {}, thisArgv) {
        requestOptions = this.sign(url, requestOptions);
        return this.fetch(url, requestOptions, options, thisArgv);
    }
    makeUrl(url) {
        if (this.apiRoot && !urlLib.parse(url).host) {
            url = this.apiRoot + url;
        }
        return url;
    }
    fetch(url, requestOptions, options = {}, thisArgv) {
        url = this.makeUrl(url);
        let rp = this._requestOptions(Object.assign({}, requestOptions, { url }), options);
        let returnValue = this.emit('fetch', {
            requestOptions: rp,
            thisArgv,
        });
        return this._request(returnValue.requestOptions, returnValue.thisArgv);
    }
    _fetchMethod(method, url, requestOptions, options = {}, thisArgv) {
        requestOptions = defaultsDeep(requestOptions, {
            method,
        });
        return this.fetch(url, requestOptions, options, thisArgv);
    }
    _request(requestOptions, thisArgv) {
        if (typeof thisArgv == 'undefined') {
            thisArgv = this.thisArgv;
        }
        let p = thisArgv ? Promise.bind(thisArgv) : Promise.resolve();
        return p
            // @ts-ignore
            .return(this.token.client._request(requestOptions))
            .catch(function (err) {
            err.requestOptions = requestOptions;
            return Promise.reject(err);
        });
    }
    _requestOptions(requestOptions, options = {}) {
        let a = getRequestOptions(requestOptions, options);
        if (this.token.accessToken && !a.body.access_token) {
            a.body.access_token = this.token.accessToken;
        }
        return a;
    }
}
exports.ClientRequest = ClientRequest;
function getRequestOptions(requestOptions, options = {}) {
    let a = {
        url: requestOptions.url,
        method: requestOptions.method || 'GET',
        body: Object.assign({}, requestOptions.body, options.body),
        query: Object.assign({}, requestOptions.query, options.query),
        headers: Object.assign({}, requestOptions.headers, options.headers)
    };
    a.body = objFilter(a.body);
    a.query = objFilter(a.query);
    a.headers = objFilter(a.headers);
    return a;
}
exports.getRequestOptions = getRequestOptions;
function objFilter(obj, filter) {
    return Object.keys(obj).reduce(function (a, b) {
        let bool;
        if (filter) {
            bool = filter(obj[b], b, obj);
        }
        else {
            bool = typeof obj[b] !== 'undefined' && obj[b] !== null;
        }
        if (bool) {
            a[b] = obj[b];
        }
        return a;
    }, {});
}
exports.objFilter = objFilter;
function url_join(...argv) {
    let a = argv.shift();
    argv = argv.filter(v => v !== null);
    if (argv.length) {
        if (a.slice(-1) != '/') {
            a += '/';
        }
        return urlLib.resolve(a, argv.join('/'));
    }
    return a;
}
exports.url_join = url_join;
function btoaBuffer(input) {
    return Buffer.from(input).toString('base64');
}
exports.btoaBuffer = btoaBuffer;
exports.btoa = typeof Buffer === 'function' ? btoaBuffer : window.btoa;
function auth(username, password) {
    return 'Basic ' + exports.btoa(toString(username) + ':' + toString(password));
}
exports.auth = auth;
function toString(str) {
    return str == null ? '' : String(str);
}
exports.toString = toString;
function request(method, url, body, headers) {
    return Promise.resolve(popsicle.get({
        url,
        body,
        method,
        headers
    }));
}
exports.request = request;
exports.default = ClientRequest;
