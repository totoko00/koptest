# koptest

FastAPI と OpenAI を利用した簡易ジョブマッチングのデモプロジェクトです。

## セットアップ

依存パッケージのインストール:

```bash
pip install -r requirements.txt
```

環境変数 `OPENAI_API_KEY` を設定し、サーバーを起動します。 `.env` ファイルを用意してキーを記入しておくこともできます:

```bash
echo "OPENAI_API_KEY=your-key" > .env
uvicorn backend.main:app --reload
```

フロントエンドは Next.js 製のアプリケーションに置き換えました。
別ターミナルで下記コマンドを実行し、`http://localhost:3000` にアクセスしてください。

```bash
cd frontend
npm install
npm run dev
```

フロントエンドから FastAPI を呼び出すには `frontend/.env.local` にバックエンドの URL を設定します。サンプルとして `frontend/.env.local.example` を用意しています。

```bash
cp frontend/.env.local.example frontend/.env.local
```

旧来のシンプルな HTML 版は `legacy_frontend/index.html` に残してあります。
求人データと求職者データは txt/csv/Excel ファイルをアップロードして入力します。
