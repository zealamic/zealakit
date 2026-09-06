/** Local shims so recipe templates typecheck without installing recipe deps in this repo. */
declare module "zustand" {
  type SetState<T> = {
    (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: false): void;
    (state: T | ((state: T) => T), replace: true): void;
  };

  type StateCreator<T> = (set: SetState<T>, get: () => T, store: unknown) => T;

  type UseBoundStore<T> = {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: () => T;
    setState: SetState<T>;
  };

  export function create<T>(): (creator: StateCreator<T>) => UseBoundStore<T>;
  export function create<T>(creator: StateCreator<T>): UseBoundStore<T>;
}

declare module "nanostores" {
  export interface MapStore<T extends object> {
    get(): T;
    set(value: Partial<T> | T): void;
    setKey<K extends keyof T>(key: K, value: T[K]): void;
    subscribe(listener: (value: T) => void): () => void;
  }

  export function map<T extends object>(initial: T): MapStore<T>;
}

declare module "zod" {
  export const z: {
    object: (shape: Record<string, unknown>) => unknown;
    string: () => { min: (length: number, message?: string) => unknown };
    email: (message?: string) => unknown;
  };
}

declare module "@hookform/resolvers/zod" {
  export function zodResolver(schema: unknown): unknown;
}

declare module "react-hook-form" {
  export function useForm<T>(options?: { resolver?: unknown; defaultValues?: Partial<T> }): unknown;
}

declare module "ky" {
  interface KyResponse extends Promise<Response> {
    json<T = unknown>(): Promise<T>;
  }

  type BeforeRequestHook = (state: { request: Request }) => void | Promise<void>;

  type AfterResponseHook = (state: {
    request: Request;
    response: Response;
    retryCount: number;
  }) => unknown;

  interface KyInstance {
    (url: string, options?: unknown): KyResponse;
    create(options?: {
      prefix?: string;
      headers?: Record<string, string>;
      hooks?: {
        beforeRequest?: BeforeRequestHook[];
        afterResponse?: AfterResponseHook[];
      };
    }): KyInstance;
    post(url: string, options?: { json?: unknown }): KyResponse;
    retry(options?: { request?: Request; code?: string }): unknown;
  }

  const ky: KyInstance;
  export default ky;
}

declare module "axios" {
  interface AxiosRequestHeaders {
    Authorization?: string;
    [key: string]: string | undefined;
  }

  interface AxiosRequestConfig {
    _retry?: boolean;
    headers: AxiosRequestHeaders;
  }

  interface AxiosResponse<T = unknown> {
    status: number;
    data: T;
  }

  interface AxiosError {
    response?: { status: number };
    config?: AxiosRequestConfig;
  }

  interface AxiosInterceptorManager<T> {
    use: (
      onFulfilled?: (value: T) => T | Promise<T>,
      onRejected?: (error: AxiosError) => unknown,
    ) => number;
  }

  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    interceptors: {
      request: AxiosInterceptorManager<AxiosRequestConfig>;
      response: AxiosInterceptorManager<AxiosResponse>;
    };
  }

  interface AxiosStatic {
    create(config?: { baseURL?: string; headers?: Record<string, string> }): AxiosInstance;
    post<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>>;
  }

  const axios: AxiosStatic;
  export default axios;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
