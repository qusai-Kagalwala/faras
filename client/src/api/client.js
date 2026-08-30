// client/src/api/client.js
// Thin fetch wrapper. Feature-specific API calls (auth, survey, etc.) live
// in their own <domain>.api.js files and use this as the shared base.
//
// FIXED BUG: the previous version spread `...options` LAST in the fetch
// call, which meant options.headers (e.g. { Authorization: ... } from an
// authenticated call) completely replaced the whole headers object instead
// of merging into it — silently dropping Content-Type: application/json on
// every authenticated POST. Without that header, Express never parses the
// request body, so req.body came through as undefined server-side. Fixed
// by extracting headers separately and always merging it last, on its own.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = body && body.error ? body.error.message : res.statusText;
    const error = new Error(message);
    error.status = res.status;
    error.code = body && body.error ? body.error.code : undefined;
    throw error;
  }

  return body;
}

export const apiClient = {
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  post: (path, data, options = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(data), ...options }),
  put: (path, data, options = {}) =>
    request(path, { method: 'PUT', body: JSON.stringify(data), ...options }),
  delete: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
};