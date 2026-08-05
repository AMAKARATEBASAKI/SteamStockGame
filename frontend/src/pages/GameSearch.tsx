import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type GameInfo = {
  appid: string;
  name: string;
  player_count?: number;
};

function toDatetimeLocal(value: Date) {
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function GameSearch() {
  const [appid, setAppid] = useState("2246340");
  const [game, setGame] = useState<GameInfo | null>(null);
  const [amount, setAmount] = useState(1);
  const [autoSellTime, setAutoSellTime] = useState(() =>
    toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canBuy = useMemo(() => Boolean(game?.appid && amount > 0 && autoSellTime), [game, amount, autoSellTime]);

  async function searchGame() {
    const trimmedAppid = appid.trim();
    if (!trimmedAppid) {
      setError("AppID を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await apiFetch(`/games/${trimmedAppid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Game search failed");
      }

      setGame(data);
      setMessage(`Found: ${data.name}`);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Game search failed");
      setGame(null);
    } finally {
      setLoading(false);
    }
  }

  async function buyPosition() {
    if (!game) {
      setError("先にゲームを検索してください。");
      return;
    }

    setBuying(true);
    setError(null);
    setMessage(null);

    try {
      const response = await apiFetch("/positions/buy", {
        method: "POST",
        body: JSON.stringify({
          steam_app_id: Number(game.appid),
          amount,
          auto_sell_time: autoSellTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Purchase failed");
      }

      setMessage("購入を送信しました。footer の Open Positions / History で結果を確認できます。");
      window.dispatchEvent(new CustomEvent("market-updated"));
    } catch (buyError) {
      setError(buyError instanceof Error ? buyError.message : "Purchase failed");
    } finally {
      setBuying(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow"></p>
          <h2>ゲーム検索</h2>
        </div>
        <button className="secondary-button" type="button" onClick={searchGame} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Steam App ID</span>
          <input
            type="text"
            value={appid}
            onChange={(event) => {
              setAppid(event.target.value);
              setGame(null);
              setMessage(null);
            }}
            placeholder="steamのゲームページのurlから取得できます"
          />
        </label>

        {!game && <p className="muted">まず AppID を検索すると、購入フォームが表示されます。</p>}

        {game && (
          <div className="result-box">
            <strong>{game.name}</strong>
            <span>AppID: {game.appid}</span>
            <span>現在の同時接続数: {game.player_count ?? "-"}</span>
          </div>
        )}

        {game && (
          <div className="grid-two">
            <label className="field">
              <span>Amount</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value) || 1)}
              />
            </label>

            <label className="field">
              <span>Auto sell time</span>
              <input
                type="datetime-local"
                value={autoSellTime}
                onChange={(event) => setAutoSellTime(event.target.value)}
              />
            </label>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        {game && (
          <button className="primary-button" type="button" onClick={buyPosition} disabled={buying || !canBuy}>
            {buying ? "Buying..." : "Buy Position"}
          </button>
        )}
      </div>
    </section>
  );
}