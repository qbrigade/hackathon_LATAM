import { resolveUrl, type JsonValue } from './config';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  data: unknown;

  constructor(params: { status: number; statusText: string; url: string; data: unknown }) {
    super(`HTTP ${params.status} ${params.statusText}`);
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.data = params.data;
  }
}

function buildQuery(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function request<TResponse, TBody = unknown>(path: string, options: RequestOptions<TBody> = {}): Promise<TResponse> {
  const method = options.method ?? 'GET';
  const url = resolveUrl(path) + buildQuery(options.query);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...options.headers,
  };

  const init: RequestInit = { method, headers, signal: options.signal, credentials: 'include' };

  if (options.body !== undefined && method !== 'GET') {
    if (typeof options.body === 'string' || options.body instanceof FormData || options.body instanceof Blob) {
      // Respect caller's body and headers
      init.body = options.body as BodyInit;
    } else {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      init.body = JSON.stringify(options.body as JsonValue);
    }
  }

  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';

  let data: unknown = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else if (contentType.startsWith('text/')) {
    data = await res.text().catch(() => null);
  } else {
    data = await res.arrayBuffer().catch(() => null);
  }

  if (!res.ok) {
    throw new HttpError({ status: res.status, statusText: res.statusText, url: url, data });
  }
  return data as TResponse;
}

export const api = {
  get: <TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) =>
    request<TResponse, TBody>(path, { ...options, method: 'POST', body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) =>
    request<TResponse, TBody>(path, { ...options, method: 'PUT', body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) =>
    request<TResponse, TBody>(path, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<TResponse>(path, { ...options, method: 'DELETE' }),
};

export type ApiClient = typeof api;


