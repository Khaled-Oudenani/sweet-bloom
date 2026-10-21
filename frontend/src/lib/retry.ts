function isClientError(e: unknown) {
  const status = (e as { status?: unknown } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500;
}

/** Retries transient failures (network errors, 5xx). 4xx errors (e.g. 404) are thrown immediately. */
export async function retry<T>(fn: () => Promise<T>, tries = 3, delayMs = 1500): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (isClientError(e)) throw e;
      lastError = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}
