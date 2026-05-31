import createClient, { type Client, type Middleware } from "openapi-fetch";
import type { paths } from "../generated/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5027";

const ALLOW_401_PATHS = [
  "/auth/login",
  "/auth/first-time",
  "/auth/sso/google",
  "/auth/sso/microsoft",
  "/auth/sso/config",
];

function isAllowlisted(pathname: string) {
  return ALLOW_401_PATHS.includes(pathname) || pathname.startsWith("/auth/invitations/");
}

export class ApiRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = localStorage.getItem("auth_token");
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
  async onResponse({ request, response }) {
    if (response.status === 401 && !isAllowlisted(new URL(request.url).pathname)) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return response;
  },
};

type ApiResult<T> = Promise<{ data?: T; error?: unknown; response: Response }>;

function createApi(): Client<paths> {
  const client = createClient<paths>({ baseUrl: API_BASE_URL });
  client.use(authMiddleware);
  return client;
}

export const api = createApi();

/** Unwrap an openapi-fetch result, throwing ApiRequestError on error. */
export async function call<T>(request: ApiResult<T>): Promise<T> {
  const { data, error } = await request;
  if (error !== undefined) {
    const e = error as { error?: string; message?: string; errorCode?: string };
    throw new ApiRequestError(e.error ?? e.message ?? "Request failed", e.errorCode);
  }
  if (data === undefined) {
    return {} as T;
  }
  return data as T;
}

export class ApiClient {
  private readonly client: Client<paths>;

  constructor(client: Client<paths> = createApi()) {
    this.client = client;
  }

  get<T>(path: string): Promise<T> {
    return call<T>(this.client.GET(path as never));
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return call<T>(
      body === undefined
        ? this.client.POST(path as never)
        : this.client.POST(path as never, { body } as never)
    );
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return call<T>(
      body === undefined
        ? this.client.PUT(path as never)
        : this.client.PUT(path as never, { body } as never)
    );
  }

  delete<T>(path: string): Promise<T> {
    return call<T>(this.client.DELETE(path as never));
  }
}

export const apiClient = new ApiClient(api);
