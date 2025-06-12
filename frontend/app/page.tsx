"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, FileText, Users, Zap } from "lucide-react"

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function parseCsv(csv: string): string[][] {
  const wb = XLSX.read(csv, { type: "string" })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    blankrows: false,
  }) as string[][]
}

function objectsToRows(data: Record<string, any>[]): string[][] {
  if (data.length === 0) return []
  const headers = Object.keys(data[0])
  const rows = data.map((obj) => headers.map((h) => String(obj[h] ?? "")))
  return [headers, ...rows]
}

function objectToRows(data: Record<string, any>): string[][] {
  const headers = Object.keys(data)
  const row = headers.map((h) => String(data[h] ?? ""))
  return [headers, row]
}


export default function JobMatchingApp() {
  const [activeTab, setActiveTab] = useState("jobs")
  const [jobFile, setJobFile] = useState<File | null>(null)
  const [applicantFile, setApplicantFile] = useState<File | null>(null)
  const [jobData, setJobData] = useState<string[][]>([])
  const [applicantData, setApplicantData] = useState<string[][]>([])
  const [matchResults, setMatchResults] = useState<string[][]>([])
  const [jobsCsv, setJobsCsv] = useState("")
  const [seekersCsv, setSeekersCsv] = useState("")
  const [matchCsv, setMatchCsv] = useState("")
  const [matchJobsFile, setMatchJobsFile] = useState<File | null>(null)
  const [matchSeekersFile, setMatchSeekersFile] = useState<File | null>(null)
  const [isJobProcessing, setIsJobProcessing] = useState(false)
  const [isApplicantProcessing, setIsApplicantProcessing] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [showMatchResults, setShowMatchResults] = useState(false)

  const readUpload = async (file: File | null) => {
    if (!file) return null
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'txt' || ext === 'csv') {
      return await file.text()
    } else if (ext === 'xlsx' || ext === 'xls') {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      return XLSX.utils.sheet_to_csv(sheet)
    } else {
      alert('対応していないファイル形式です')
      return null
    }
  }

  const processJobData = async () => {
    if (!jobFile) return
    const text = await readUpload(jobFile)
    if (!text) return

    setIsJobProcessing(true)
    try {
    const response = await fetch("/api/process-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.csv) {
          setJobsCsv(data.csv)
          setJobData(parseCsv(data.csv))
        } else if (data.jobs) {
          setJobData(objectsToRows(data.jobs))
        }
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
    if (!applicantFile) return
    const text = await readUpload(applicantFile)
    if (!text) return

    setIsApplicantProcessing(true)
    try {
      const response = await fetch("/api/process-applicant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.csv) {
          setSeekersCsv(data.csv)
          setApplicantData(parseCsv(data.csv))
        } else if (data.applicant) {
          setApplicantData(objectToRows(data.applicant))
        }
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
    if (!matchJobsFile || !matchSeekersFile) {
      alert("求人CSVと求職者CSVの両方をアップロードしてください")
      return
    }
    const jobsCsvText = await readUpload(matchJobsFile)
    const seekersCsvText = await readUpload(matchSeekersFile)
    if (!jobsCsvText || !seekersCsvText) return

    setIsMatching(true)
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobs_csv: jobsCsvText, seekers_csv: seekersCsvText }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.csv) {
          setMatchCsv(data.csv)
          setMatchResults(parseCsv(data.csv))
        } else if (data.matches) {
          setMatchResults(objectsToRows(data.matches))
          setMatchCsv("")
        }
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
                  <label className="block text-sm font-medium mb-2">求人データファイル (.txt, .csv, .xlsx)</label>
                  <input
                    type="file"
                    accept=".txt,.csv,.xlsx,.xls"
                    onChange={(e) => setJobFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={processJobData} disabled={isJobProcessing || !jobFile} className="w-full">
                  {isJobProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    "整形してCSVに変換"
                  )}
                </Button>

                {jobData.length > 1 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">変換結果</h3>
                    <div className="border rounded-lg overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {jobData[0].map((h, i) => (
                              <TableHead key={i}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobData.slice(1).map((row, index) => (
                            <TableRow key={index}>
                              {row.map((cell, i) => (
                                <TableCell key={i}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button
                      onClick={() => downloadCsv(jobsCsv, "jobs.csv")}
                      className="mt-2"
                    >
                      CSVダウンロード
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applicant" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">求職者データファイル (.txt, .csv, .xlsx)</label>
                  <input
                    type="file"
                    accept=".txt,.csv,.xlsx,.xls"
                    onChange={(e) => setApplicantFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button
                  onClick={processApplicantData}
                  disabled={isApplicantProcessing || !applicantFile}
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

                {applicantData.length > 1 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">変換結果</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {applicantData[0].map((h, i) => (
                              <TableHead key={i}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applicantData.slice(1).map((row, index) => (
                            <TableRow key={index}>
                              {row.map((cell, i) => (
                                <TableCell key={i}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button
                      onClick={() => downloadCsv(seekersCsv, "seekers.csv")}
                      className="mt-2"
                    >
                      CSVダウンロード
                    </Button>
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
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">求人CSV</label>
                <input
                  type="file"
                  accept=".txt,.csv,.xlsx,.xls"
                  onChange={(e) => setMatchJobsFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">求職者CSV</label>
                <input
                  type="file"
                  accept=".txt,.csv,.xlsx,.xls"
                  onChange={(e) => setMatchSeekersFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <Button
              onClick={executeMatching}
              disabled={isMatching || !matchJobsFile || !matchSeekersFile}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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

            {(!matchJobsFile || !matchSeekersFile) && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                求人CSVと求職者CSVを選択してからマッチングを実行してください
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

            {matchResults.length > 1 && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {matchResults[0].map((h, i) => (
                        <TableHead key={i}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchResults.slice(1).map((row, index) => (
                      <TableRow key={index}>
                        {row.map((cell, i) => (
                          <TableCell key={i}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  onClick={() =>
                    downloadCsv(matchCsv || XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(matchResults)), "match.csv")
                  }
                  className="mt-4"
                >
                  CSVダウンロード
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
