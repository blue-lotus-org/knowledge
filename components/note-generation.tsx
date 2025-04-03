"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { generateNote } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, Plus, X, Download, FileUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

// Import the simple renderer directly
import SimpleMarkdownRenderer from "@/components/simple-markdown-renderer"

export default function NoteGeneration() {
  const [prompt, setPrompt] = useState("")
  const [relatedNotes, setRelatedNotes] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedNote, setGeneratedNote] = useState("")
  const [useSimpleRenderer, setUseSimpleRenderer] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useState<HTMLInputElement | null>(null)

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

  const handleAddNote = () => {
    if (newNote.trim() && !relatedNotes.includes(newNote.trim())) {
      setRelatedNotes([...relatedNotes, newNote.trim()])
      setNewNote("")
    }
  }

  const handleRemoveNote = (index: number) => {
    setRelatedNotes(relatedNotes.filter((_, i) => i !== index))
  }

  const handleGenerateNote = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt for note generation.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateNote(prompt, relatedNotes)
      setGeneratedNote(result)
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedNote) return

    const filename =
      prompt
        .slice(0, 30)
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase() + ".md"
    const blob = new Blob([generatedNote], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Note downloaded",
      description: `Your note has been downloaded as ${filename}`,
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setNewNote(content)

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
          <CardTitle>AI-Powered Note Generation</CardTitle>
          <CardDescription>
            Generate new notes based on a prompt and optionally include context from related notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Prompt</label>
            <Textarea
              placeholder="Describe what you want the AI to write about..."
              className="min-h-[100px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: "Write a comprehensive note about the history and applications of neural networks"
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Related Notes (Optional)</label>
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
            <p className="text-xs text-muted-foreground mb-2">
              Add content from related notes to provide context for the AI.
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Paste content from a related note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button onClick={handleAddNote} size="icon" aria-label="Add note">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {relatedNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  Note {index + 1}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 p-0"
                    onClick={() => handleRemoveNote(index)}
                    aria-label={`Remove note ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {relatedNotes.length === 0 && (
                <p className="text-sm text-muted-foreground">No related notes added yet.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateNote} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Note"
            )}
          </Button>
        </CardFooter>
      </Card>

      {generatedNote && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Generated Note</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download as Markdown
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
              <TabsContent value="preview">
                <div className="border rounded-lg p-4 bg-card">
                  {useSimpleRenderer ? (
                    <SimpleMarkdownRenderer content={generatedNote} />
                  ) : (
                    <MarkdownRenderer content={generatedNote} />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="markdown">
                <Textarea value={generatedNote} readOnly className="min-h-[400px] font-mono text-sm" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

