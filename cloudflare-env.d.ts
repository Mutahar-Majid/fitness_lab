declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
  };
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface D1Database {
  prepare(query: string): {
    run(): Promise<unknown>;
    all<T = unknown>(): Promise<{ results: T[] }>;
    first<T = unknown>(): Promise<T | null>;
    bind(...values: unknown[]): D1Database["prepare"];
  };
  batch(statements: Array<ReturnType<D1Database["prepare"]>>): Promise<unknown[]>;
}
