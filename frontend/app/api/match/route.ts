import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobs, applicant } = await request.json()

    // FastAPI バックエンドへのリクエスト
    const response = await fetch(`${process.env.FASTAPI_URL}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobs, applicant }),
    })

    if (!response.ok) {
      throw new Error("Failed to execute matching")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error executing matching:", error)

    // デモ用のモックデータ
    const mockMatches = [
      {
        applicant_name: "田中太郎",
        matched_job: "Webエンジニア - 株式会社テック",
        compatibility_score: 85,
        comment:
          "React、TypeScriptのスキルが求人要件と高い適合性を示しています。フロントエンド開発の経験も豊富で、即戦力として活躍できると思われます。",
      },
      {
        applicant_name: "田中太郎",
        matched_job: "データサイエンティスト - AI株式会社",
        compatibility_score: 65,
        comment:
          "PythonとSQLのスキルは評価できますが、機械学習の専門知識についてはさらなる学習が必要かもしれません。ただし、エンジニアとしての基礎力は十分です。",
      },
    ]

    return NextResponse.json({ matches: mockMatches })
  }
}
