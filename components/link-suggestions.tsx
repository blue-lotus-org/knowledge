"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { suggestLinks, type LinkSuggestion } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LinkIcon, Plus, X, FileUp, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LinkSuggestions() {
  const [noteContent, setNoteContent] = useState("")
  const [existingNotes, setExistingNotes] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useState<HTMLInputElement | null>(null)

  const handleAddNote = () => {
    if (newNote.trim() && !existingNotes.includes(newNote.trim())) {
      setExistingNotes([...existingNotes, newNote.trim()])
      setNewNote("")
    }
  }

  const handleRemoveNote = (index: number) => {
    setExistingNotes(existingNotes.filter((_, i) => i !== index))
  }

  const handleSuggestLinks = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Empty note",
        description: "Please enter some note content to analyze.",
        variant: "destructive",
      })
      return
    }

    if (existingNotes.length === 0) {
      toast({
        title: "No existing notes",
        description: "Please add at least one existing note to compare with.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      const linkResults = await suggestLinks(noteContent, existingNotes)
      setSuggestions(linkResults)

      if (linkResults.length === 0) {
        setError("No link suggestions found. Try adding more detailed notes or content.")
      }
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
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

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
    reader.readAsText(selectedFile)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Link Suggestions</CardTitle>
          <CardDescription>
            Analyze your current note to find potential links to existing notes in your vault.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Current Note Content</label>
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
              placeholder="Paste your current note content here..."
              className="min-h-[150px]"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Existing Notes in Your Vault</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add note title..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button onClick={handleAddNote} size="icon" aria-label="Add note">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {existingNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {note}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 p-0"
                    onClick={() => handleRemoveNote(index)}
                    aria-label={`Remove ${note}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {existingNotes.length === 0 && (
                <Alert>
                  <AlertDescription>No notes added yet. Add some note titles to compare with.</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSuggestLinks} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Find Link Suggestions"
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

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Suggested Links
            </CardTitle>
            <CardDescription>These notes might be relevant to your current content.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions
                .sort((a, b) => b.relevance - a.relevance)
                .map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium obsidian-link">{suggestion.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {Math.round(suggestion.relevance * 100)}% match
                        </span>
                        <Progress value={suggestion.relevance * 100} className="w-24 h-2" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

