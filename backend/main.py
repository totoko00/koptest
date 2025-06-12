import os
from fastapi import FastAPI, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Load prompt template for matching from file
match_prompt_path = os.path.join(os.path.dirname(__file__), "..", "match_prompt.txt")
with open(match_prompt_path, encoding="utf-8") as f:
    MATCH_PROMPT_TEMPLATE = f.read()

# Simple health check at the root path
@app.get("/")
async def read_root():
    return {"status": "ok"}

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
    prompt = f"""あなたは一流の転職エージェントとして、以下の企業の求人情報のテキストを整理してCSV形式で出力してください。\nカラムは会社名,求人概要,希望スキルです。\n\n### 入力\n{data.text}\n"""
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    csv_text = response.choices[0].message.content.strip()
    return {"csv": csv_text}

@app.post("/process_seekers")
async def process_seekers(data: TextIn):
    prompt = f"""あなたは一流の転職エージェントとして、以下の求職者プロフィールを整理してCSV形式で出力してください。\nカラムは基本情報（名前・年齢）,スキル,希望です。\n\n### 入力\n{data.text}\n"""
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    csv_text = response.choices[0].message.content.strip()
    return {"csv": csv_text}

@app.post("/match")
async def match(data: MatchIn):
    prompt = MATCH_PROMPT_TEMPLATE.format(
        jobs_csv=data.jobs_csv,
        seekers_csv=data.seekers_csv,
    )
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    csv_text = response.choices[0].message.content.strip()
    return {"csv": csv_text}
