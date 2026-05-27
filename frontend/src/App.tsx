import GameSearch from "./pages/GameSearch";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import RankingPage from "./pages/RankingPage";
import OpenPage from "./pages/OpenPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [me, setMe] = useState<{ player_name: string; balance: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  useEffect(() => {
    async function fetchMe() {
      if (!token) return setMe(null);
      try {
        const res = await fetch("http://localhost:8080/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return setMe(null);
        const data = await res.json();
        setMe({ player_name: data.player_name || data.name || 'Player', balance: data.balance || 0 });
      } catch {
        setMe(null);
      }
    }

    fetchMe();
  }, [token]);

  if (!token) {
    return <Login onSuccess={setToken} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow" onClick={() => navigate("/")}>Steam Stock Game</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {me && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{me.player_name}</div>
              <div style={{ fontSize: 12 }}>Balance: {me.balance}</div>
            </div>
          )}
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="content-grid">
        <Routes>
          <Route path="/" element={<GameSearch />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/open" element={<OpenPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      <footer className="footer-shell">
        <button className="primary-button" type="button" onClick={() => navigate("/ranking")}>
          ランキング
        </button>
        <button className="primary-button" type="button" onClick={() => navigate("/open")}>
          購入中
        </button>
        <button className="primary-button" type="button" onClick={() => navigate("/history")}>
          履歴
        </button>
      </footer>
    </div>
  );
}

export default App;