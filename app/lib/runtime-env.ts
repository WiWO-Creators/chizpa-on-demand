type CloudflareBindings = typeof import("cloudflare:workers").env;

/**
 * Resolve Worker bindings lazily. Sites validates the built Worker in a Node
 * process, where the `cloudflare:` protocol is unavailable at module load.
 * Request handlers still receive the real bindings when they execute on
 * Cloudflare.
 */
export async function getRuntimeEnv<Extra extends object = Record<string, never>>() {
  const { env } = await import("cloudflare:workers");
  return env as CloudflareBindings & Extra;
}
