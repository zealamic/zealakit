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

declare module "react" {
  export type ReactNode = unknown;
  export type ReactElement = unknown;
  export type FC<P = Record<string, unknown>> = (props: P) => ReactElement | null;
}

declare module "react/jsx-runtime" {
  namespace JSX {
    type Element = unknown;
    type IntrinsicElements = Record<string, unknown>;
  }
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxDEV(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export const Fragment: unknown;
}

declare module "react/jsx-dev-runtime" {
  export * from "react/jsx-runtime";
}

declare module "react-router" {
  export function RouterProvider(props: { router: unknown }): unknown;
}

declare module "antd" {
  export function ConfigProvider(props: { children?: unknown; theme?: unknown }): unknown;
  export function App(props: { children?: unknown }): unknown;
  export const Button: unknown;
  export const Card: unknown;
  export const Flex: unknown;
  export const Form: unknown;
  export const Input: unknown;
  export const Modal: unknown;
  export const Select: unknown;
  export const Space: unknown;
  export const Table: unknown;
  export const Tag: unknown;
  export const Typography: unknown;
}

declare module "@mui/material" {
  export function ThemeProvider(props: { children?: unknown; theme?: unknown }): unknown;
  export function CssBaseline(props?: { children?: unknown }): unknown;
  export const Box: unknown;
  export const Button: unknown;
  export const Card: unknown;
  export const Chip: unknown;
  export const Dialog: unknown;
  export const Select: unknown;
  export const Stack: unknown;
  export const Table: unknown;
  export const TextField: unknown;
  export const Typography: unknown;
}

declare module "@mui/material/styles" {
  export function createTheme(options?: unknown): unknown;
}

declare module "@mui/material-nextjs/v16-appRouter" {
  export function AppRouterCacheProvider(props: {
    children?: unknown;
    options?: Record<string, unknown>;
  }): unknown;
}

declare module "cn" {
  export function cn(...inputs: unknown[]): string;
}

declare module "class-variance-authority" {
  export function cva(...args: unknown[]): (props?: Record<string, unknown>) => string;
  export type VariantProps<T> = Record<string, unknown>;
}

declare module "@base-ui/react/button" {
  export namespace Button {
    type Props = Record<string, unknown>;
  }
  export function Button(props: Button.Props): unknown;
}

declare module "@tailwindcss/vite" {
  export default function tailwindcss(): unknown;
}

declare module "@vitejs/plugin-react" {
  export default function react(): unknown;
}

declare module "vite" {
  export function defineConfig(config: unknown): unknown;
}

/** Minimal Storybook types for recipe overlays (deps installed only in generated apps). */
type StorybookFrameworkConfig = {
  name: string;
  options?: Record<string, unknown>;
};

type StorybookConfigShape = {
  stories?: string | string[];
  addons?: string[];
  framework?: string | StorybookFrameworkConfig;
  staticDirs?: string[];
};

type StorybookPreviewShape = {
  parameters?: Record<string, unknown>;
  decorators?: unknown[];
};

type StorybookMetaShape<T = unknown> = {
  title?: string;
  component?: T;
  tags?: string[];
  args?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
};

type StorybookStoryShape<TMeta = unknown> = {
  args?: Record<string, unknown>;
  render?: (...args: unknown[]) => unknown;
  parameters?: Record<string, unknown>;
};

declare module "@storybook/react-vite" {
  export type StorybookConfig = StorybookConfigShape;
  export type Preview = StorybookPreviewShape;
  export type Meta<T = unknown> = StorybookMetaShape<T>;
  export type StoryObj<TMeta = unknown> = StorybookStoryShape<TMeta>;
}

declare module "@storybook/nextjs" {
  export type StorybookConfig = StorybookConfigShape;
  export type Preview = StorybookPreviewShape;
  export type Meta<T = unknown> = StorybookMetaShape<T>;
  export type StoryObj<TMeta = unknown> = StorybookStoryShape<TMeta>;
}

/** Nest / ORM recipe overlays (deps installed only in generated server apps). */
declare module "@nestjs/common" {
  export function Module(metadata?: Record<string, unknown>): ClassDecorator;
  export function Global(): ClassDecorator;
  export function Injectable(): ClassDecorator;
  export function Inject(token?: unknown): ParameterDecorator;
}

declare module "@nestjs/typeorm" {
  export type TypeOrmModuleOptions = {
    type?: string;
    url?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    autoLoadEntities?: boolean;
    synchronize?: boolean;
    [key: string]: unknown;
  };

  export const TypeOrmModule: {
    forRoot(options?: TypeOrmModuleOptions): unknown;
    forRootAsync(options?: { useFactory: (...args: unknown[]) => unknown }): unknown;
    forFeature(entities?: unknown[]): unknown;
  };
}

declare module "typeorm" {
  export type DataSourceOptions = {
    type?: string;
    url?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    synchronize?: boolean;
    entities?: string[];
    [key: string]: unknown;
  };

  export class DataSource {
    constructor(options?: DataSourceOptions | unknown);
  }
  export function Entity(options?: unknown): ClassDecorator;
  export function Column(options?: unknown): PropertyDecorator;
  export function PrimaryColumn(options?: unknown): PropertyDecorator;
}

declare module "@mikro-orm/nestjs" {
  export const MikroOrmModule: {
    forRoot(options?: Record<string, unknown>): unknown;
    forRootAsync(options?: { useFactory: (...args: unknown[]) => unknown }): unknown;
    forFeature(entities?: unknown[]): unknown;
  };
}

declare module "@mikro-orm/decorators/legacy" {
  export const ReflectMetadataProvider: unknown;
  export function Entity(options?: unknown): ClassDecorator;
  export function Property(options?: unknown): PropertyDecorator;
  export function PrimaryKey(options?: unknown): PropertyDecorator;
}

declare module "@mikro-orm/sqlite" {
  export const SqliteDriver: unknown;
  export class EntityManager {}
}

declare module "@mikro-orm/core" {
  export type EntityRepositoryType = unknown;
  export class MikroORM {
    static init(options?: unknown): Promise<MikroORM>;
  }
}

declare module "better-sqlite3" {
  export default class Database {
    constructor(filename?: string, options?: unknown);
  }
}

declare module "drizzle-orm/better-sqlite3" {
  export function drizzle<TSchema extends Record<string, unknown> = Record<string, unknown>>(
    client: unknown,
    options?: { schema?: TSchema },
  ): { schema?: TSchema } & Record<string, unknown>;
}

declare module "drizzle-orm/sqlite-core" {
  type ColumnBuilder = {
    primaryKey: () => ColumnBuilder;
    notNull: () => ColumnBuilder;
  };

  export function sqliteTable(
    name: string,
    columns: Record<string, unknown>,
  ): Record<string, unknown>;
  export function text(name: string): ColumnBuilder;
  export function integer(name: string, options?: { mode?: string }): ColumnBuilder;
}

declare module "drizzle-kit" {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
}
