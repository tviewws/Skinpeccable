export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

type SuccessResponse = {
  success: boolean;
  error?: string;
};

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return response.json() as Promise<T>;
}

export async function fetchJsonSuccess<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const data = await fetchJson<T & SuccessResponse>(url, options);
  if (!data.success) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}
