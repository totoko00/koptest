import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    // FastAPI バックエンドへのリクエスト
    const response = await fetch(`${process.env.FASTAPI_URL}/process-jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error("Failed to process jobs")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing jobs:", error)

    // デモ用のモックデータ
    const mockJobs = [
      {
        id: "JOB001",
        title: "Webエンジニア",
        company: "株式会社テック",
        location: "東京都渋谷区",
        salary: "年収400-600万円",
        requirements: "React, Node.js, TypeScript",
      },
      {
        id: "JOB002",
        title: "データサイエンティスト",
        company: "AI株式会社",
        location: "東京都港区",
        salary: "年収500-800万円",
        requirements: "Python, SQL, 機械学習",
      },
    ]

    return NextResponse.json({ jobs: mockJobs })
  }
}
