import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Position } from "../types/position";

export default function OpenPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/positions/open');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load open positions');
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
          <p className="eyebrow">Open Positions</p>
          <h2>購入中のポジション</h2>
        </div>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="list-grid">
          {positions.length === 0 ? (
            <p className="muted">購入中のポジションはありません。</p>
          ) : (
            positions.map((position) => (
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
    </section>
  );
}
