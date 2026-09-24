/**
 * Small fetch wrapper for browser -> API calls.
 * Throws an Error with `.status`, `.fields` and `.details` on failure.
 */
export async function apiRequest(url, { method = 'GET', body, signal } = {}) {
  const response = await fetch(url, {
    method,
    signal,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed. Please check your connection and try again.');
    error.status = response.status;
    error.fields = data.details?.fields;
    error.details = data.details;
    throw error;
  }
  return data;
}
