import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    // FastAPI バックエンドへのリクエスト
    const response = await fetch(`${process.env.FASTAPI_URL}/process-applicant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error("Failed to process applicant")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing applicant:", error)

    // デモ用のモックデータ
    const mockApplicant = {
      name: "田中太郎",
      skills: "React, Vue.js, Python, SQL",
      experience: "Webエンジニア3年、フロントエンド開発メイン",
      location: "東京都内",
      salary_expectation: "500万円以上",
    }

    return NextResponse.json({ applicant: mockApplicant })
  }
}
