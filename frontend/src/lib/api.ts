const API_URL = "http://localhost:8080/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const authorization = token ? `Bearer ${token}` : undefined;

  const headers = {
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
    ...(options.headers || {}),
  };

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}