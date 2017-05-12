/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
