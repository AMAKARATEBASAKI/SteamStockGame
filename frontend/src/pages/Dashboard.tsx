import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Position } from "../types/position";

type RankingUser = {
  id: number;
  player_name: string;
  balance: number;
};

type ViewMode = "ranking" | "open" | "history";

export default function Dashboard() {
  const [view, setView] = useState<ViewMode>("ranking");
  const currentViewRef = useRef<ViewMode>("ranking");
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [historyPositions, setHistoryPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadView("ranking");

    const handler = () => {
      loadView(currentViewRef.current);
    };

    window.addEventListener("market-updated", handler);

    return () => window.removeEventListener("market-updated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadView(target: ViewMode) {
    setView(target);
    currentViewRef.current = target;
    setLoading(true);
    setError(null);

    try {
      if (target === "ranking") {
        const response = await apiFetch("/ranking");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load ranking");
        }
        setRanking(data);
      }

      if (target === "open") {
        const response = await apiFetch("/positions/open");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load open positions");
        }
        setOpenPositions(data);
      }

      if (target === "history") {
        const response = await apiFetch("/positions/history");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load history");
        }
        setHistoryPositions(data);
      }
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card footer-panel">
      <div className="card-header">
        <div>
          <p className="eyebrow">Footer Panel</p>
          <h2>{view === "ranking" ? "Ranking" : view === "open" ? "購入中の履歴" : "履歴"}</h2>
        </div>
        <div className="button-row">
          <button className={view === "ranking" ? "primary-button" : "secondary-button"} type="button" onClick={() => loadView("ranking")}>Ranking</button>
          <button className={view === "open" ? "primary-button" : "secondary-button"} type="button" onClick={() => loadView("open")}>購入中の履歴</button>
          <button className={view === "history" ? "primary-button" : "secondary-button"} type="button" onClick={() => loadView("history")}>履歴</button>
        </div>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && view === "ranking" && (
        <div className="list-grid">
          {ranking.length === 0 ? (
            <p className="muted">ランキングはまだありません。</p>
          ) : (
            ranking.map((user, index) => (
              <article key={user.id} className="list-item">
                <strong>#{index + 1} {user.player_name}</strong>
                <span>Balance: {user.balance}</span>
              </article>
            ))
          )}
        </div>
      )}

      {!loading && !error && view === "open" && (
        <div className="list-grid">
          {openPositions.length === 0 ? (
            <p className="muted">購入中のポジションはありません。</p>
          ) : (
            openPositions.map((position) => (
              <article key={position.id} className="list-item">
                <strong>AppID: {position.steam_app_id}</strong>
                <span>Amount: {position.amount}</span>
                <span>Buy Price: {position.buy_price}</span>
                <span>Auto Sell: {position.auto_sell_time}</span>
              </article>
            ))
          )}
        </div>
      )}

      {!loading && !error && view === "history" && (
        <div className="list-grid">
          {historyPositions.length === 0 ? (
            <p className="muted">履歴はまだありません。</p>
          ) : (
            historyPositions.map((position) => (
              <article key={position.id} className="list-item">
                <strong>AppID: {position.steam_app_id}</strong>
                <span>Amount: {position.amount}</span>
                <span>Buy Total: {position.buy_total}</span>
                <span>Sell Total: {position.sell_total}</span>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}