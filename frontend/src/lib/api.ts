export const API_URL = 
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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

type AuthResponse = {
  token?: string;
  error?: string;
  message?: string;
};

type AuthSuccessResponse = AuthResponse & {
  token: string;
};

function getJapaneseAuthMessage(status: number, bodyText: string) {
  if (status === 401) {
    return "メールアドレスまたはパスワードが違います。";
  }

  if (status === 422) {
    return "入力内容を確認してください。";
  }

  if (status === 409) {
    return "そのメールアドレスは登録済みです。";
  }

  if (status >= 500) {
    return "サーバーエラーが発生しました。";
  }

  if (bodyText.includes("<!DOCTYPE") || bodyText.includes("<html")) {
    return "サーバー応答が正しくありません。";
  }

  return "認証に失敗しました。";
}

async function requestAuth(path: string, body: { email: string; password: string }) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const data = contentType.includes("application/json") && rawText ? (JSON.parse(rawText) as AuthResponse) : null;

  if (!response.ok) {
    const serverRaw = (data?.error || data?.message || "").toString();
    let message = "";

    if (serverRaw) {
      if (/unauthor/i.test(serverRaw)) {
        message = "メールアドレスまたはパスワードが違います。";
      } else if (/validation/i.test(serverRaw) || response.status === 422) {
        message = "入力内容を確認してください。";
      } else if (/already|exists|duplicate/i.test(serverRaw) || response.status === 409) {
        message = "そのメールアドレスは登録済みです。";
      } else if (response.status >= 500) {
        message = "サーバーエラーが発生しました。";
      } else {
        message = getJapaneseAuthMessage(response.status, rawText);
      }
    } else {
      message = getJapaneseAuthMessage(response.status, rawText);
    }

    throw new Error(message);
  }

  if (!data?.token) {
    throw new Error("トークンの取得に失敗しました。");
  }

  return data as AuthSuccessResponse;
}

export function loginUser(body: { email: string; password: string }) {
  return requestAuth("/login", body);
}

export async function registerUser(body: { name: string; email: string; password: string }) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const data = contentType.includes("application/json") && rawText ? (JSON.parse(rawText) as AuthResponse) : null;

  if (!response.ok) {
    const serverRaw = (data?.error || data?.message || "").toString();
    let message = "";

    if (serverRaw) {
      if (/unauthor/i.test(serverRaw)) {
        message = "メールアドレスまたはパスワードが違います。";
      } else if (/validation/i.test(serverRaw) || response.status === 422) {
        message = "入力内容を確認してください。";
      } else if (/already|exists|duplicate/i.test(serverRaw) || response.status === 409) {
        message = "そのメールアドレスは登録済みです。";
      } else if (response.status >= 500) {
        message = "サーバーエラーが発生しました。";
      } else {
        message = getJapaneseAuthMessage(response.status, rawText);
      }
    } else {
      message = getJapaneseAuthMessage(response.status, rawText);
    }

    throw new Error(message);
  }

  if (!data?.token) {
    throw new Error("トークンの取得に失敗しました。");
  }

  return data as AuthSuccessResponse;
}