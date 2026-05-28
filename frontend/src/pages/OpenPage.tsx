import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Position } from "../types/position";

export default function OpenPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellingIds, setSellingIds] = useState<number[]>([]);

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

  useEffect(() => {
    load();
  }, []);

  async function sellPosition(id: number) {
    if (sellingIds.includes(id)) return;

    setSellingIds((current) => [...current, id]);
    setError(null);

    try {
      const res = await apiFetch(`/positions/${id}/sell`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to sell position');
      }

      await load();
      window.dispatchEvent(new CustomEvent('market-updated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSellingIds((current) => current.filter((value) => value !== id));
    }
  }

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
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => sellPosition(position.id)}
                  disabled={sellingIds.includes(position.id)}
                >
                  {sellingIds.includes(position.id) ? 'Selling...' : 'Sell Now'}
                </button>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
