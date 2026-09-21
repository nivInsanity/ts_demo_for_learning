/**
 * A scriptable stand-in for an HTTP layer, used by module 13.
 *
 * Real network calls in a unit test are slow, flaky and untestable for the
 * interesting cases - you cannot easily make a real server return 503 twice
 * and then 200. A transport you can script gives you every case in
 * milliseconds.
 *
 * You do not need to edit this file.
 */

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  body: unknown;
}

export interface Transport {
  send(request: HttpRequest): Promise<HttpResponse>;
}

export class FakeTransport implements Transport {
  /** Every request that was sent, in order. */
  readonly requests: HttpRequest[] = [];

  readonly #routes = new Map<string, HttpResponse[]>();

  /**
   * Script one or more responses for a route. They are returned in order;
   * once the list is down to its last entry, that one repeats forever.
   *
   *   transport.on('GET', '/users', { status: 503, body: null }, { status: 200, body: [] })
   */
  on(
    method: HttpRequest['method'],
    path: string,
    ...responses: HttpResponse[]
  ): this {
    this.#routes.set(`${method} ${path}`, [...responses]);
    return this;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push({ ...request });

    const queued = this.#routes.get(`${request.method} ${request.path}`);
    if (queued === undefined || queued.length === 0) {
      return { status: 404, body: { error: 'no route scripted' } };
    }

    return queued.length === 1 ? queued[0]! : queued.shift()!;
  }

  /** How many times a given route was called. */
  countOf(method: HttpRequest['method'], path: string): number {
    return this.requests.filter((r) => r.method === method && r.path === path).length;
  }
}
