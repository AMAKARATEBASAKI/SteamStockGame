import { useEffect, useState } from "react";

import { apiFetch } from "../lib/api";

import type { Position } from "../types/position";

type RankingUser = {
  id: number;
  player_name: string;
  balance: number;
};

export default function Dashboard() {
  const [openPositions, setOpenPositions] = useState<Position[]>([]);

  const [historyPositions, setHistoryPositions] =
    useState<Position[]>([]);

  const [ranking, setRanking] = useState<RankingUser[]>([]);

  useEffect(() => {
    fetchOpenPositions();
    fetchHistory();
    fetchRanking();
  }, []);

  async function fetchOpenPositions() {
    const res = await apiFetch("/positions/open");

    const data = await res.json();

    setOpenPositions(data);
  }

  async function fetchHistory() {
    const res = await apiFetch("/positions/history");

    const data = await res.json();

    setHistoryPositions(data);
  }

  async function fetchRanking() {
    const res = await apiFetch("/ranking");

    const data = await res.json();

    setRanking(data);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Steam Stock Game</h1>

      <hr />

      <h2>Open Positions</h2>

      {openPositions.map((position) => (
        <div
          key={position.id}
          style={{
            border: "1px solid gray",
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          <div>AppID: {position.steam_app_id}</div>

          <div>Amount: {position.amount}</div>

          <div>Buy Price: {position.buy_price}</div>

          <div>
            Auto Sell Time: {position.auto_sell_time}
          </div>
        </div>
      ))}

      <hr />

      <h2>History</h2>

      {historyPositions.map((position) => (
        <div
          key={position.id}
          style={{
            border: "1px solid gray",
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          <div>AppID: {position.steam_app_id}</div>

          <div>Amount: {position.amount}</div>

          <div>Buy Total: {position.buy_total}</div>

          <div>Sell Total: {position.sell_total}</div>
        </div>
      ))}

      <hr />

      <h2>Ranking</h2>

      {ranking.map((user, index) => (
        <div
          key={user.id}
          style={{
            border: "1px solid gray",
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          <div>Rank: {index + 1}</div>

          <div>Name: {user.player_name}</div>

          <div>Balance: {user.balance}</div>
        </div>
      ))}
    </div>
  );
}