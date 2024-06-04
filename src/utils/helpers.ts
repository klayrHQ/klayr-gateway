export const waitTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GatewayResponse<T> {
  constructor(
    public data: T,
    public meta: object,
  ) {}
}
