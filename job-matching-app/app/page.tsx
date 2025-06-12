"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, FileText, Users, Zap } from "lucide-react"

interface JobData {
  id: string
  title: string
  company: string
  location: string
  salary: string
  requirements: string
}

interface ApplicantData {
  name: string
  skills: string
  experience: string
  location: string
  salary_expectation: string
}

interface MatchResult {
  applicant_name: string
  matched_job: string
  compatibility_score: number
  comment: string
}

export default function JobMatchingApp() {
  const [activeTab, setActiveTab] = useState("jobs")
  const [jobText, setJobText] = useState("")
  const [applicantText, setApplicantText] = useState("")
  const [jobData, setJobData] = useState<JobData[]>([])
  const [applicantData, setApplicantData] = useState<ApplicantData[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isJobProcessing, setIsJobProcessing] = useState(false)
  const [isApplicantProcessing, setIsApplicantProcessing] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [showMatchResults, setShowMatchResults] = useState(false)

  const processJobData = async () => {
    if (!jobText.trim()) return

    setIsJobProcessing(true)
    try {
      const response = await fetch("/api/process-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: jobText }),
      })

      if (response.ok) {
        const data = await response.json()
        setJobData(data.jobs)
      } else {
        console.error("Failed to process job data")
      }
    } catch (error) {
      console.error("Error processing job data:", error)
    } finally {
      setIsJobProcessing(false)
    }
  }

  const processApplicantData = async () => {
    if (!applicantText.trim()) return

    setIsApplicantProcessing(true)
    try {
      const response = await fetch("/api/process-applicant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: applicantText }),
      })

      if (response.ok) {
        const data = await response.json()
        setApplicantData([data.applicant])
      } else {
        console.error("Failed to process applicant data")
      }
    } catch (error) {
      console.error("Error processing applicant data:", error)
    } finally {
      setIsApplicantProcessing(false)
    }
  }

  const executeMatching = async () => {
    if (jobData.length === 0 || applicantData.length === 0) {
      alert("求人データと求職者データの両方を入力・変換してください")
      return
    }

    setIsMatching(true)
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobs: jobData,
          applicant: applicantData[0],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMatchResults(data.matches)
        setShowMatchResults(true)
      } else {
        console.error("Failed to execute matching")
      }
    } catch (error) {
      console.error("Error executing matching:", error)
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">求人マッチングシステム</h1>
          <p className="text-lg text-gray-600">AI を活用した求人・求職者マッチングプラットフォーム</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              データ入力・変換
            </CardTitle>
            <CardDescription>求人情報と求職者情報をテキストで入力し、AIがCSV形式に整形します</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  求人データ入力
                </TabsTrigger>
                <TabsTrigger value="applicant" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  求職者データ入力
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">求人情報（複数件対応）</label>
                  <Textarea
                    placeholder="ここに求人情報を複数件貼り付けてください&#10;&#10;例：&#10;【求人1】&#10;職種：Webエンジニア&#10;会社：株式会社テック&#10;場所：東京都渋谷区&#10;給与：年収400-600万円&#10;必要スキル：React, Node.js, TypeScript&#10;&#10;【求人2】&#10;職種：データサイエンティスト&#10;会社：AI株式会社&#10;..."
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>
                <Button onClick={processJobData} disabled={isJobProcessing || !jobText.trim()} className="w-full">
                  {isJobProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    "整形してCSVに変換"
                  )}
                </Button>

                {jobData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">変換結果</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>職種</TableHead>
                            <TableHead>会社名</TableHead>
                            <TableHead>勤務地</TableHead>
                            <TableHead>給与</TableHead>
                            <TableHead>必要スキル</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobData.map((job, index) => (
                            <TableRow key={index}>
                              <TableCell>{job.id}</TableCell>
                              <TableCell>{job.title}</TableCell>
                              <TableCell>{job.company}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>{job.salary}</TableCell>
                              <TableCell>{job.requirements}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applicant" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">求職者情報（1人分）</label>
                  <Textarea
                    placeholder="ここに1人分の求職者情報を貼り付けてください&#10;&#10;例：&#10;名前：田中太郎&#10;スキル：React, Vue.js, Python, SQL&#10;経験：Webエンジニア3年、フロントエンド開発メイン&#10;希望勤務地：東京都内&#10;希望年収：500万円以上"
                    value={applicantText}
                    onChange={(e) => setApplicantText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>
                <Button
                  onClick={processApplicantData}
                  disabled={isApplicantProcessing || !applicantText.trim()}
                  className="w-full"
                >
                  {isApplicantProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    "整形してCSVに変換"
                  )}
                </Button>

                {applicantData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">変換結果</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>名前</TableHead>
                            <TableHead>スキル</TableHead>
                            <TableHead>経験</TableHead>
                            <TableHead>希望勤務地</TableHead>
                            <TableHead>希望年収</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applicantData.map((applicant, index) => (
                            <TableRow key={index}>
                              <TableCell>{applicant.name}</TableCell>
                              <TableCell>{applicant.skills}</TableCell>
                              <TableCell>{applicant.experience}</TableCell>
                              <TableCell>{applicant.location}</TableCell>
                              <TableCell>{applicant.salary_expectation}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              マッチング実行
            </CardTitle>
            <CardDescription>入力されたデータを基にAIがマッチング分析を実行します</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={executeMatching}
              disabled={isMatching || jobData.length === 0 || applicantData.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {isMatching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  マッチング実行中...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  マッチングを実行
                </>
              )}
            </Button>

            {(jobData.length === 0 || applicantData.length === 0) && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                求人データと求職者データの両方を変換してからマッチングを実行してください
              </p>
            )}
          </CardContent>
        </Card>

        <Dialog open={showMatchResults} onOpenChange={setShowMatchResults}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                マッチング結果
              </DialogTitle>
              <DialogDescription>AIが分析した求人とのマッチング結果です</DialogDescription>
            </DialogHeader>

            {matchResults.length > 0 && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>求職者名</TableHead>
                      <TableHead>マッチ求人</TableHead>
                      <TableHead>相性スコア</TableHead>
                      <TableHead>コメント</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{result.applicant_name}</TableCell>
                        <TableCell>{result.matched_job}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                                style={{ width: `${result.compatibility_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{result.compatibility_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-gray-600 line-clamp-3">{result.comment}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
