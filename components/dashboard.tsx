"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import NoteAnalysis from "@/components/note-analysis"
import LinkSuggestions from "@/components/link-suggestions"
import QuestionAnswering from "@/components/question-answering"
import GraphView from "@/components/graph-view"
import NoteGeneration from "@/components/note-generation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import SettingsModal from "@/components/settings-modal"
import { validateApiKey } from "@/lib/ai-service"

export default function Dashboard() {
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { toast } = useToast()

  // Function to check API key validity
  const checkApiKey = async () => {
    setIsCheckingApiKey(true)
    const apiKey = localStorage.getItem("mistral-api-key")

    if (!apiKey) {
      setApiKeyValid(false)
      setIsCheckingApiKey(false)
      return
    }

    // Check if we have a stored validation result
    const keyValidStatus = localStorage.getItem("mistral-api-key-valid")
    if (keyValidStatus) {
      setApiKeyValid(keyValidStatus === "true")
      setIsCheckingApiKey(false)

      // If the key was previously marked as invalid, validate it again
      // in case the user fixed their subscription or the API is back online
      if (keyValidStatus === "false") {
        validateApiKey(apiKey).then((isValid) => {
          setApiKeyValid(isValid)
          localStorage.setItem("mistral-api-key-valid", isValid.toString())
        })
      }
    } else {
      // If no stored validation, validate the key
      try {
        const isValid = await validateApiKey(apiKey)
        setApiKeyValid(isValid)
        localStorage.setItem("mistral-api-key-valid", isValid.toString())
      } catch (error) {
        setApiKeyValid(false)
        localStorage.setItem("mistral-api-key-valid", "false")
      } finally {
        setIsCheckingApiKey(false)
      }
    }
  }

  // Check API key on component mount
  useEffect(() => {
    checkApiKey()
  }, [])

  // Listen for changes to the API key in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mistral-api-key" || e.key === "mistral-api-key-valid") {
        checkApiKey()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Re-check API key when settings modal is closed
  const handleSettingsClose = () => {
    setIsSettingsOpen(false)
    checkApiKey()
  }

  return (
    <div className="container py-6">
      {isCheckingApiKey ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p>Checking API key...</p>
            </div>
          </CardContent>
        </Card>
      ) : !apiKeyValid ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              {localStorage.getItem("mistral-api-key")
                ? "Your Mistral API key is invalid. Please update it in the settings."
                : "Please set your Mistral API key in the settings to use AI features."}
            </p>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Open Settings
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">Note Analysis</TabsTrigger>
          <TabsTrigger value="links">Link Suggestions</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="graph">Graph View</TabsTrigger>
          <TabsTrigger value="generation">Note Generation</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis">
          <NoteAnalysis />
        </TabsContent>
        <TabsContent value="links">
          <LinkSuggestions />
        </TabsContent>
        <TabsContent value="qa">
          <QuestionAnswering />
        </TabsContent>
        <TabsContent value="graph">
          <GraphView />
        </TabsContent>
        <TabsContent value="generation">
          <NoteGeneration />
        </TabsContent>
      </Tabs>

      <SettingsModal isOpen={isSettingsOpen} onClose={handleSettingsClose} />
    </div>
  )
}

