import Dashboard from "./pages/Dashboard";
import GameSearch from "./pages/GameSearch";
import Login from "./components/Login";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  if (!token) {
    return <Login onSuccess={setToken} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Steam Stock Game</p>
          <h1>Trading Console</h1>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
          }}
        >
          Logout
        </button>
      </header>

      <main className="content-grid">
        <GameSearch />
      </main>

      <footer className="footer-shell">
        <Dashboard />
      </footer>
    </div>
  );
}

export default App;