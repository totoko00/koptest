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

ブラウザで `frontend/index.html` を開くとデモ UI を利用できます。
