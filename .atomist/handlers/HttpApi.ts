export type HttpMethod = "head" | "get" | "post" | "patch" | "put" | "delete";

export class Http {
    public readonly url: string;
    public readonly method: HttpMethod;
    public readonly config?: HttpConfig;
}

export class HttpConfig {
    public readonly body?: string;
    public readonly headers?: object;
}
