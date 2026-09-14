type EnvBag = Record<string, string | undefined>;

export function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export async function getRuntimeEnv<Extra extends object = Record<string, never>>() {
  return process.env as unknown as EnvBag & Extra;
}
