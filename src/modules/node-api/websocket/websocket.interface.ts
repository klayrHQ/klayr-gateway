export interface Defer<T> {
  promise: Promise<T>;
  resolve: (result: T) => void;
  reject: (error?: Error) => void;
}

export interface JSONRPCNotification<T> {
  readonly id: never;
  readonly jsonrpc: string;
  readonly method: string;
  readonly params?: T;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: string | number | boolean | Record<string, unknown>;
}

export interface JSONRPCResponse<T> {
  readonly id: number;
  readonly jsonrpc: string;
  readonly method: never;
  readonly params: never;
  readonly error?: JSONRPCError;
  readonly result?: T;
}

export type JSONRPCMessage<T> = JSONRPCNotification<T> | JSONRPCResponse<T>;
