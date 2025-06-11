import os
from fastapi import FastAPI, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Serve the demo UI at the root path
@app.get("/")
async def read_index():
    return FileResponse("frontend/index.html")

# Dummy empty response for favicon requests
@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

class TextIn(BaseModel):
    text: str

class MatchIn(BaseModel):
    jobs_csv: str
    seekers_csv: str

@app.post("/process_jobs")
async def process_jobs(data: TextIn):
    prompt = f"""以下のテキストを整理してCSV形式で出力してください。\nカラムは会社名,求人概要,希望スキルです。\n\n### 入力\n{data.text}\n"""
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
    )
    csv_text = response.choices[0].message.content.strip()
    return {"csv": csv_text}

@app.post("/process_seekers")
async def process_seekers(data: TextIn):
    prompt = f"""以下の求職者プロフィールを整理してCSV形式で出力してください。\nカラムは基本情報（名前・年齢）,スキル,希望です。\n\n### 入力\n{data.text}\n"""
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
    )
    csv_text = response.choices[0].message.content.strip()
    return {"csv": csv_text}

@app.post("/match")
async def match(data: MatchIn):
    prompt = f"""以下の求人CSVと求職者CSVを基にマッチングを行ってください。\n求人CSV:\n{data.jobs_csv}\n\n求職者CSV:\n{data.seekers_csv}\n\n結果は次のフォーマットでCSV出力してください:\n求職者名,マッチ求人,相性スコア（1〜100）,コメント\n"""
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
    )
    csv_text = response.choices[0].message.content.strip()
    return {"csv": csv_text}
