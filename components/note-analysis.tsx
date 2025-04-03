"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { analyzeNote, type NoteAnalysisResult } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, Tag, Link, AlertTriangle, FileUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NoteAnalysis() {
  const [noteContent, setNoteContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<NoteAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useState<HTMLInputElement | null>(null)

  const handleAnalyze = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Empty note",
        description: "Please enter some note content to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      const analysisResult = await analyzeNote(noteContent)
      setResult(analysisResult)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setNoteContent(content)

      toast({
        title: "File uploaded",
        description: "The note content has been loaded from the file.",
      })
    }
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Failed to read the file",
        variant: "destructive",
      })
    }
    reader.readAsText(file)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Note Analysis</CardTitle>
          <CardDescription>
            Paste your note content below to analyze key themes, potential links, and knowledge gaps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Note Content</label>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4 mr-2" />
              Upload Note
            </Button>
            <input
              type="file"
              ref={(el) => (fileInputRef.current = el)}
              className="hidden"
              accept=".md,.txt"
              onChange={handleFileUpload}
            />
          </div>
          <Textarea
            placeholder="Paste your note content here..."
            className="min-h-[200px]"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Note"
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{result.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Key Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.keyThemes.length > 0 ? (
                  result.keyThemes.map((theme, index) => (
                    <Badge key={index} variant="secondary">
                      {theme}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No key themes identified.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              <CardTitle>Suggested Links</CardTitle>
            </CardHeader>
            <CardContent>
              {result.suggestedLinks.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.suggestedLinks.map((link, index) => (
                    <li key={index} className="obsidian-link">
                      {link}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No suggested links found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle>Knowledge Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              {result.knowledgeGaps.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.knowledgeGaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No knowledge gaps identified.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

