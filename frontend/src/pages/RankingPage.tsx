import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/ranking');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load ranking');
        setRanking(data);
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
          <p className="eyebrow">Ranking</p>
          <h2>Ranking</h2>
        </div>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="list-grid">
          {ranking.length === 0 ? (
            <p className="muted">ランキングはまだありません。</p>
          ) : (
            ranking.map((user: any, i: number) => (
              <article key={user.id} className="list-item">
                <strong>#{i + 1} {user.player_name}</strong>
                <span>Balance: {user.balance}</span>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
