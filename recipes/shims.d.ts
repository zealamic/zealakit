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
