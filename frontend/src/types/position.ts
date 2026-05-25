export type Position = {
  id: number;
  steam_app_id: number;

  amount: number;

  buy_price: number;
  buy_total: number;

  buy_time: string;
  auto_sell_time: string;

  selling_price: number | null;
  sell_total: number | null;
  sell_time: string | null;

  status: "open" | "closed";
};