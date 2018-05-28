/**
 * Created by user on 2018/5/28/028.
 */

import * as ClientOAuth2 from 'client-oauth2';
import * as request from 'client-oauth2/src/request';
import * as defaultsDeep from 'defaults-deep';
import * as Promise from 'bluebird';
import EventEmitter from 'events-returnvalue';
import * as urlLib from 'url';
import * as popsicle from 'popsicle';

export type IOptions = ClientOAuth2.Options & {
	apiRoot?: string,
};

export class ClientRequest extends EventEmitter
{
	token: ClientOAuth2.Token;
	options: IOptions;
	thisArgv?;

	apiRoot?: string;

	constructor(token: ClientOAuth2.Token, options: IOptions = {}, thisArgv?)
	{
		super();

		this.token = token;
		this.options = Object.assign({}, options || {});
		this.thisArgv = thisArgv || null;

		if (this.options.apiRoot)
		{
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

	get<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		return this._fetchMethod<T>('GET', url, requestOptions, options, thisArgv);
	}

	post<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		return this._fetchMethod<T>('POST', url, requestOptions, options, thisArgv);
	}

	put<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		return this._fetchMethod<T>('PUT', url, requestOptions, options, thisArgv);
	}

	delete<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		return this._fetchMethod<T>('DELETE', url, requestOptions, options, thisArgv);
	}

	patch<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		return this._fetchMethod<T>('PATCH', url, requestOptions, options, thisArgv);
	}

	sign(url: string, requestOptions?: IRequestOptions)
	{
		requestOptions = this.token.sign({
			...requestOptions,
			url,
		});

		return requestOptions;
	}

	fetchSign<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		requestOptions = this.sign(url, requestOptions);

		return this.fetch<T>(url, requestOptions, options, thisArgv);
	}

	makeUrl(url: string)
	{
		if (this.apiRoot && !urlLib.parse(url).host)
		{
			url = this.apiRoot + url;
		}

		return url;
	}

	fetch<T>(url: string, requestOptions?: IRequestOptions, options: ClientOAuth2.Options = {}, thisArgv?)
	{
		url = this.makeUrl(url);

		let rp = this._requestOptions({
			...requestOptions,
			url,
		}, options);

		let returnValue = this.emit('fetch', {
			requestOptions: rp,
			thisArgv,
		});

		return this._request<T>(returnValue.requestOptions, returnValue.thisArgv);
	}

	_fetchMethod<T>(method: string,
		url: string,
		requestOptions?: IRequestOptions,
		options: ClientOAuth2.Options = {},
		thisArgv?
	)
	{
		requestOptions = defaultsDeep(requestOptions, {
			method,
		});

		return this.fetch<T>(url, requestOptions, options, thisArgv);
	}

	_request<T>(requestOptions: IRequestOptions, thisArgv?: any): Promise<IRequestReturn<T>>
	{
		if (typeof thisArgv == 'undefined')
		{
			thisArgv = this.thisArgv;
		}

		let p = thisArgv ? Promise.bind(thisArgv) : Promise.resolve();

		return p
		// @ts-ignore
			.return(this.token.client._request(requestOptions))
			.catch<ErrorClientOAuth2>(function (err: ErrorClientOAuth2)
			{
				err.requestOptions = requestOptions;

				return Promise.reject(err);
			})
			;
	}

	_requestOptions(requestOptions: IRequestOptions, options: ClientOAuth2.Options = {})
	{
		let a = getRequestOptions(requestOptions, options);

		if (this.token.accessToken && !a.body.access_token)
		{
			a.body.access_token = this.token.accessToken;
		}

		return a;
	}

}

export function getRequestOptions(requestOptions: IRequestOptions, options: ClientOAuth2.Options = {})
{
	let a: IRequestOptions = {
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

export type IRequestOptions = {
	url?: string,
	method?: string,
	body?: {
		access_token?: string,
		[k: string]: any,
	},
	query?: {
		access_token?: string,
		[k: string]: any,
	},
	headers?: {
		Authorization?: string,
		Pragma?: string,
		'Cache-Control'?: string,
		[k: string]: any,
	},
};

export type IRequestReturn<T> = T;

export type ErrorClientOAuth2 = Error & {
	status: number,
	body: string,
	code: string,

	requestOptions?: IRequestOptions,
};

export function objFilter<T extends object, K extends keyof T>(obj: T,
	filter?: (value: T[K], key: string, obj: T) => boolean
)
{
	return Object.keys(obj).reduce(function (a, b)
	{
		let bool: boolean;

		if (filter)
		{
			bool = filter(obj[b], b, obj);
		}
		else
		{
			bool = typeof obj[b] !== 'undefined' && obj[b] !== null;
		}

		if (bool)
		{
			a[b] = obj[b];
		}

		return a;
	}, {}) as {
		[P in keyof T]?: T[P]
	}
}

export function url_join(...argv: string[])
{
	let a = argv.shift();

	argv = argv.filter(v => v !== null);

	if (argv.length)
	{
		if (a.slice(-1) != '/')
		{
			a += '/';
		}

		return urlLib.resolve(a, argv.join('/'))
	}

	return a;
}

export function btoaBuffer(input: string): string
{
	return Buffer.from(input).toString('base64')
}

export const btoa = typeof Buffer === 'function' ? btoaBuffer : window.btoa as (input: string) => string;

export function auth(username: string, password: string)
{
	return 'Basic ' + btoa(toString(username) + ':' + toString(password))
}

export function toString(str: string)
{
	return str == null ? '' : String(str)
}

export function request(method: string, url: string, body, headers)
{
	return Promise.resolve(popsicle.get({
		url,
		body,
		method,
		headers
	}));
}

export default ClientRequest
