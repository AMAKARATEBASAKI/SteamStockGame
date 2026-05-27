import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type HttpMethod = "GET" | "POST";

type ApiResult = {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  bodyText: string;
};

type EndpointOption = {
  label: string;
  method: HttpMethod;
  path: string;
  requiresAuth: boolean;
  bodyTemplate?: string;
};

const ENDPOINTS: EndpointOption[] = [
  { label: "Health check", method: "GET", path: "/ping", requiresAuth: false },
  { label: "Ranking", method: "GET", path: "/ranking", requiresAuth: false },
  { label: "Open positions", method: "GET", path: "/positions/open", requiresAuth: true },
  { label: "History positions", method: "GET", path: "/positions/history", requiresAuth: true },
  { label: "Game by AppID", method: "GET", path: "/games/2246340", requiresAuth: true },
  {
    label: "Buy position (sample)",
    method: "POST",
    path: "/positions/buy",
    requiresAuth: true,
    bodyTemplate: JSON.stringify(
      {
        steam_app_id: 2246340,
        amount: 1,
        auto_sell_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      null,
      2,
    ),
  },
];

function readTokenFromStorage(): string {
  return localStorage.getItem("token") || "";
}

export default function ApiTester() {
  const [selected, setSelected] = useState(0);
  const [method, setMethod] = useState<HttpMethod>(ENDPOINTS[0].method);
  const [path, setPath] = useState(ENDPOINTS[0].path);
  const [tokenInput, setTokenInput] = useState(readTokenFromStorage());
  const [requestBody, setRequestBody] = useState(ENDPOINTS[0].bodyTemplate || "{}");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const endpoint = ENDPOINTS[selected];

  const curlPreview = useMemo(() => {
    const auth = tokenInput.trim()
      ? " -H \"Authorization: Bearer ***\""
      : "";
    const contentType = method === "POST" ? " -H \"Content-Type: application/json\"" : "";
    const body = method === "POST" ? " -d '<json body>'" : "";

    return `curl.exe -i -X ${method}${contentType}${auth}${body} http://localhost:8080/api${path}`;
  }, [method, path, tokenInput]);

  function applyPreset(index: number) {
    const preset = ENDPOINTS[index];
    setSelected(index);
    setMethod(preset.method);
    setPath(preset.path);
    setRequestBody(preset.bodyTemplate || "{}");
    setResult(null);
  }

  function applyToken() {
    const value = tokenInput.trim();
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  }

  async function sendRequest() {
    setLoading(true);
    setResult(null);
    applyToken();

    const startedAt = performance.now();

    try {
      const options: RequestInit = { method };
      if (method === "POST") {
        options.body = requestBody;
      }

      const response = await apiFetch(path, options);
      const bodyText = await response.text();
      const headers: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setResult({
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        durationMs: Math.round(performance.now() - startedAt),
        headers,
        bodyText,
      });
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      const message = error instanceof Error ? error.message : String(error);

      setResult({
        ok: false,
        status: 0,
        statusText: "Network Error",
        durationMs,
        headers: {},
        bodyText: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ border: "1px solid #d4d4d4", padding: "16px", marginBottom: "24px" }}>
      <h2>Backend API Tester</h2>
      <p style={{ marginTop: 0 }}>
        バックエンド API の疎通確認用ツールです。プリセットを選ぶか、任意のパスを指定して実行できます。
      </p>

      <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
        <label htmlFor="preset">Preset</label>
        <select id="preset" value={selected} onChange={(e) => applyPreset(Number(e.target.value))}>
          {ENDPOINTS.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}
            </option>
          ))}
        </select>
        <small>
          Auth required: {endpoint.requiresAuth ? "Yes" : "No"}
        </small>
      </div>

      <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
        <label htmlFor="method">Method</label>
        <select id="method" value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>

        <label htmlFor="path">Path (starts with /)</label>
        <input
          id="path"
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/ping"
        />

        <label htmlFor="token">Bearer token (optional)</label>
        <input
          id="token"
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Paste JWT or Sanctum token"
        />

        {method === "POST" && (
          <>
            <label htmlFor="body">Request body (JSON)</label>
            <textarea
              id="body"
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={8}
            />
          </>
        )}
      </div>

      <button type="button" onClick={sendRequest} disabled={loading}>
        {loading ? "Sending..." : "Send Request"}
      </button>

      <div style={{ marginTop: "12px" }}>
        <strong>cURL preview:</strong>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: "8px" }}>{curlPreview}</pre>
      </div>

      {result && (
        <div style={{ marginTop: "16px" }}>
          <h3>Response</h3>
          <p>
            Status: {result.status} {result.statusText} | OK: {String(result.ok)} | Duration: {result.durationMs}ms
          </p>

          <h4>Headers</h4>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: "8px" }}>
            {Object.keys(result.headers).length
              ? JSON.stringify(result.headers, null, 2)
              : "(no response headers)"}
          </pre>

          <h4>Body</h4>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: "8px" }}>
            {result.bodyText || "(empty body)"}
          </pre>
        </div>
      )}
    </section>
  );
}
