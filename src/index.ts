// See https://github.com/nextauthjs/next-auth/blob/db8fcc3c82249a017c97c2cd05bc8426bb20cafd/packages/frameworks-solid-start/src/index.ts

import { Auth } from "@auth/core";
import type { AuthAction, Session } from "@auth/core/types";
import type { AuthConfig } from "@auth/core";

export interface RouterContext {
  request: Request;
}

export interface VikeAuthConfig extends Omit<AuthConfig, "raw"> {
  /**
   * Defines the base path for the auth routes.
   * @default '/api/auth'
   */
  prefix?: string;
}

const env: Record<string, string | undefined> =
  typeof process?.env !== "undefined"
    ? process.env
    : typeof import.meta?.env !== "undefined"
    ? import.meta.env
    : {};

const actions: AuthAction[] = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error",
];

function getVikeAuthConfig(config: VikeAuthConfig): { prefix: string, authOptions: VikeAuthConfig } {
  const { prefix = "/api/auth", ...authOptions } = config;
  authOptions.secret ??= env.AUTH_SECRET;
  authOptions.trustHost ??= !!(
    env.AUTH_TRUST_HOST ??
    env.VERCEL ??
    env.NODE_ENV !== "production"
  );
  authOptions.basePath ??= prefix;

  return {
    prefix,
    authOptions
  }
}

function VikeAuthHandler(prefix: string, authOptions: VikeAuthConfig) {
  return async (context: RouterContext) => {
    const { request } = context;
    const url = new URL(request.url);
    const action = url.pathname
      .slice(prefix.length + 1)
      .split("/")[0] as AuthAction;

    if (!actions.includes(action)) {
      throw new Error(`action ${action} is not supported`);
    }

    if (!url.pathname.startsWith(prefix + "/")) {
      throw new Error(
        `handler should only be configured for prefix: ${prefix}`
      );
    }

    return await Auth(request, authOptions);
  };
}

export function VikeAuth(config: VikeAuthConfig) {
  const { prefix, authOptions } = getVikeAuthConfig(config)

  return VikeAuthHandler(prefix, authOptions);
}

export async function getSession(
  req: Request,
  options: Omit<AuthConfig, "raw">
): Promise<Session | null> {
  const { authOptions } = getVikeAuthConfig(options)

  const url = new URL(`${authOptions.basePath}/session`, req.url);
  const response = await Auth(
    new Request(url, { headers: req.headers }),
    authOptions
  );

  const { status = 200 } = response;

  const data = await response.json();

  if (!data || !Object.keys(data).length) return null;
  if (status === 200) return data;
  throw new Error(data.message);
}
