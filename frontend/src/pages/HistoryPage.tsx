import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Position } from "../types/position";

export default function HistoryPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/positions/history');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load history');
        setPositions(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>履歴</h2>
        </div>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="list-grid">
          {positions.length === 0 ? (
            <p className="muted">履歴はまだありません。</p>
          ) : (
            positions.map((position) => (
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
