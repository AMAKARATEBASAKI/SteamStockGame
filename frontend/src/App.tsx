import { useState } from "react";
import "./App.css";

type PositionStatus = "open" | "closed";

type Position = {
  id: number;
  appId: number;
  buyPrice: number;
  quantity: number;
  buyTime: Date;
  autoSellTime: Date;
  status: PositionStatus;
  sellPrice?: number;
  sellTime?: Date;
};

export default function App() {
  /* ========= 認証（ダミー） ========= */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ========= ユーザー ========= */
  const userName = "DemoUser";
  const [coins, setCoins] = useState(20000);

  /* ========= 株価 ========= */
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  /* ========= ポジション ========= */
  const [positions, setPositions] = useState<Position[]>([]);
  const [nextId, setNextId] = useState(1);

  /* ========= フォーム ========= */
  const [appId, setAppId] = useState<number>(2246340);
  const [quantity, setQuantity] = useState<number>(1);
  const [autoSellMinutes, setAutoSellMinutes] = useState<number>(5);

  /* ========= 損益 ========= */
  const [profitOrLoss, setprofitOrLoss] = useState(0);

  /* ========= 株価取得 ========= */
  const fetchStockPrice = async () => {
  setLoadingPrice(true);
  try {
    const res = await fetch(
      `http://localhost:8000/playercount/${appId}`
    );
    const data = await res.json();
    setStockPrice(data.player_count);
  } catch {
    const dummy = 5000 + Math.floor(Math.random() * 5000);
    setStockPrice(dummy);
  } finally {
    setLoadingPrice(false);
  }
};


  /* ========= 購入 ========= */
  const buyStock = () => {
    if (stockPrice === null) return;

    const cost = stockPrice * quantity;
    if (coins < cost) {
      alert("コイン不足");
      return;
    }

    const now = new Date();
    const autoSellTime = new Date(
      now.getTime() + autoSellMinutes * 60 * 1000
    );

    setCoins(coins - cost);
    setPositions([
      ...positions,
      {
        id: nextId,
        appId,
        buyPrice: stockPrice,
        quantity,
        buyTime: now,
        autoSellTime,
        status: "open",
      },
    ]);
    setNextId(nextId + 1);
  };

  /* ========= 売却 ========= */
  const sellPosition = (id: number) => {
    if (stockPrice === null) return;

    const target = positions.find(
      (p) => p.id === id && p.status === "open"
    );
    if (!target) return;

    const profit = (stockPrice - target.buyPrice) * target.quantity;
    setprofitOrLoss(profit);
    setCoins((c) => c + stockPrice * target.quantity);

    setPositions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "closed",
              sellPrice: stockPrice,
              sellTime: new Date(),
            }
          : p
      )
    );
  };

  /* ========= 画面 ========= */
  if (!isLoggedIn) {
    return (
      <div className="login">
        <h2>Steam Stock Game</h2>
        <input placeholder="email" />
        <input placeholder="password" type="password" />
        <button onClick={() => setIsLoggedIn(true)}>ログイン</button>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Steam 株式ゲーム</h1>
        <div className="user">
          <span>{userName}</span>
          <span>{coins.toLocaleString()} coin</span>
        </div>
      </header>

      <section className="card">
        <h3>現在の株価</h3>
        <div className="price">
          {stockPrice === null ? "--" : stockPrice.toLocaleString()}
        </div>
        <button onClick={fetchStockPrice} disabled={loadingPrice}>
          {loadingPrice ? "取得中..." : "株価更新"}
        </button>
      </section>

      <section className="card">
        <h3>株購入</h3>
        <input
          type="number"
          value={appId}
          onChange={(e) => setAppId(Number(e.target.value))}
          placeholder="App ID"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="数量"
        />
        <select
          value={autoSellMinutes}
          onChange={(e) => setAutoSellMinutes(Number(e.target.value))}
        >
          <option value={1}>1分</option>
          <option value={5}>5分</option>
          <option value={10}>10分</option>
        </select>
        <button onClick={buyStock}>購入</button>
      </section>

      <section className="card">
        <h3>保有中</h3>
        {positions.filter(p => p.status === "open").map(p => (
          <div className="row" key={p.id}>
            <span>AppID {p.appId}</span>
            <span>購入株価{p.buyPrice.toLocaleString()}</span>
            <span>{p.quantity} 株</span>
            <button onClick={() => sellPosition(p.id)}>売却</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>売却履歴</h3>
        {positions.filter(p => p.status === "closed").map(p => (
          <div className="row" key={p.id}>
            <span>AppID {p.appId}</span>
            <span>
              {p.buyPrice.toLocaleString()} → {p.sellPrice.toLocaleString()}
            </span>
            <span>
              {profitOrLoss.toLocaleString()} coin
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
