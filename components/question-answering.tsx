"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { answerQuestion } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, FileQuestion, FileUp } from "lucide-react"
import dynamic from "next/dynamic"

// Import the simple renderer directly
import SimpleMarkdownRenderer from "@/components/simple-markdown-renderer"

export default function QuestionAnswering() {
  const [vaultContent, setVaultContent] = useState("")
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState("")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // State to track if we should use the simple renderer
  const [useSimpleRenderer, setUseSimpleRenderer] = useState(false)

  // Try to load the full renderer, fall back to simple if it fails
  const MarkdownRenderer = dynamic(
    () =>
      import("@/components/markdown-renderer").catch(() => {
        setUseSimpleRenderer(true)
        return import("@/components/simple-markdown-renderer")
      }),
    {
      ssr: false,
      loading: () => <div className="animate-pulse bg-muted h-40 rounded-md"></div>,
    },
  )

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Empty question",
        description: "Please enter a question to ask.",
        variant: "destructive",
      })
      return
    }

    if (!vaultContent.trim()) {
      toast({
        title: "No vault content",
        description: "Please provide some vault content to search through.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await answerQuestion(question, vaultContent)
      setAnswer(result)
    } catch (error) {
      toast({
        title: "Failed to get answer",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setVaultContent(content)

      toast({
        title: "File uploaded",
        description: "The vault content has been loaded from the file.",
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
          <CardTitle>Ask Questions About Your Vault</CardTitle>
          <CardDescription>
            Ask questions about your notes and get answers based on your knowledge base.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Vault Content</label>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <FileUp className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".md,.txt" onChange={handleFileUpload} />
            </div>
            <Textarea
              placeholder="Paste relevant content from your vault here..."
              className="min-h-[200px]"
              value={vaultContent}
              onChange={(e) => setVaultContent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Include only the most relevant notes to get better answers.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Question</label>
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about your notes..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
              />
              <Button onClick={handleAskQuestion} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {answer && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Answer</CardTitle>
              <CardDescription>{question}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {useSimpleRenderer ? <SimpleMarkdownRenderer content={answer} /> : <MarkdownRenderer content={answer} />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

