# SteamStockGame

SteamStockGame は、Steam のゲーム情報を使って株のように売買するデモWebアプリケーションです。

主な機能
- Steam AppID を入力してゲームを検索
- 現在の同時接続数をもとに株価を計算
- 購入中の株を管理し、手動で売却
- 売却履歴とランキングを表示

構成
- フロントエンド: React + TypeScript + Vite
- バックエンド: Laravel
- DB: MySQL

起動方法
```bash
docker compose up -d
```

testアカウント
```email
test@example.com
```
```password
password123
```

フロントエンド
```text
http://localhost:5173
```

バックエンド API
```text
http://localhost:8080/api
```

