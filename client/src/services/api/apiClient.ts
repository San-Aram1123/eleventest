export const API_BASE = '/api';

/**
 * Safely parses response body as JSON.
 * Avoids crashing with "Unexpected end of JSON input" on empty or non-JSON error pages.
 */
export async function parseResponse<T = any>(res: Response, fallbackError = 'Request failed'): Promise<T> {
  const text = await res.text();
  let data: any = null;

  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || (text && text.length < 200 ? text : `${fallbackError} (Status: ${res.status})`);
    throw new Error(errorMsg);
  }

  return (data !== null ? data : {}) as T;
}
