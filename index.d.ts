/**
 * Created by user on 2018/5/28/028.
 */
import * as ClientOAuth2 from 'client-oauth2';
import * as Promise from 'bluebird';
import EventEmitter from 'events-returnvalue';
import * as popsicle from 'popsicle';
export declare type IOptions = ClientOAuth2.Options & {
    apiRoot?: string;
};
export declare class ClientRequest extends EventEmitter {
    token: ClientOAuth2.Token;
    options: IOptions;
    thisArgv?: any;
    apiRoot?: string;
    constructor(token: ClientOAuth2.Token, options?: IOptions, thisArgv?: any);
    get<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    post<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    put<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    delete<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    patch<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    sign(url: string, requestOptions?: IRequestOptions): IRequestOptions;
    fetchSign<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    makeUrl(url: string): string;
    fetch<T>(url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    _fetchMethod<T>(method: string, url: string, requestOptions?: IRequestOptions, options?: ClientOAuth2.Options, thisArgv?: any): Promise<T>;
    _request<T>(requestOptions: IRequestOptions, thisArgv?: any): Promise<IRequestReturn<T>>;
    _requestOptions(requestOptions: IRequestOptions, options?: ClientOAuth2.Options): IRequestOptions;
}
export declare function getRequestOptions(requestOptions: IRequestOptions, options?: ClientOAuth2.Options): IRequestOptions;
export declare type IRequestOptions = {
    url?: string;
    method?: string;
    body?: {
        access_token?: string;
        [k: string]: any;
    };
    query?: {
        access_token?: string;
        [k: string]: any;
    };
    headers?: {
        Authorization?: string;
        Pragma?: string;
        'Cache-Control'?: string;
        [k: string]: any;
    };
};
export declare type IRequestReturn<T> = T;
export declare type ErrorClientOAuth2 = Error & {
    status: number;
    body: string;
    code: string;
    requestOptions?: IRequestOptions;
};
export declare function objFilter<T extends object, K extends keyof T>(obj: T, filter?: (value: T[K], key: string, obj: T) => boolean): { [P in keyof T]?: T[P]; };
export declare function url_join(...argv: string[]): string;
export declare function btoaBuffer(input: string): string;
export declare const btoa: typeof btoaBuffer;
export declare function auth(username: string, password: string): string;
export declare function toString(str: string): string;
export declare function request(method: string, url: string, body: any, headers: any): Promise<popsicle.Response>;
export default ClientRequest;
