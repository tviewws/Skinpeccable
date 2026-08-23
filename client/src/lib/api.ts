/*
 * SKINPECCABLE GLOWTIQUE — Backend fetch helper
 *
 * fetch() only rejects on network failures, so a 500 or an HTML error page
 * from the backend used to slip through as a successful response and get
 * misreported (or ignored) further up. apiFetch turns every failure mode —
 * unreachable server, non-2xx status, unparseable body, `success: false`
 * payload — into a single ApiError carrying the backend's own message.
 */

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiEnvelope {
  success?: boolean;
  error?: string;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BACKEND_URL}${path}`, init);
  } catch (err) {
    throw new ApiError(
      'Could not reach the server. Please check your connection and try again.',
      0,
      { cause: err }
    );
  }

  const body = await res.text();
  let data: (T & ApiEnvelope) | null = null;

  if (body) {
    try {
      data = JSON.parse(body) as T & ApiEnvelope;
    } catch (err) {
      throw new ApiError(
        `Server returned an unreadable response (HTTP ${res.status}).`,
        res.status,
        { cause: err }
      );
    }
  }

  if (!res.ok || data === null || data.success === false) {
    throw new ApiError(
      data?.error || `Request failed with status ${res.status}.`,
      res.status
    );
  }

  return data;
}

export function postJson<T = unknown>(
  path: string,
  payload: unknown
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
