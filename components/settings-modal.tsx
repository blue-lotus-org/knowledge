"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { validateApiKey } from "@/lib/ai-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const MISTRAL_MODELS = [
  { id: "mistral-small-latest", name: "Mistral Small (Latest)" },
  { id: "pixtral-12b-2409", name: "Pixtral 12B" },
  { id: "open-codestral-mamba", name: "Open Codestral Mamba" },
  { id: "open-mistral-nemo", name: "Open Mistral Nemo" },
]

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState(MISTRAL_MODELS[0].id)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidatingKey, setIsValidatingKey] = useState(false)
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load settings from localStorage when component mounts
    if (typeof window !== "undefined") {
      const savedApiKey = localStorage.getItem("mistral-api-key") || ""
      const savedModel = localStorage.getItem("mistral-model") || MISTRAL_MODELS[0].id

      setApiKey(savedApiKey)
      setSelectedModel(savedModel)

      // Check if we have a stored validation result
      const keyValidStatus = localStorage.getItem("mistral-api-key-valid")
      if (keyValidStatus) {
        setIsKeyValid(keyValidStatus === "true")
      } else if (savedApiKey) {
        // If we have a key but no validation status, validate it
        validateKey(savedApiKey)
      }
    }
  }, [isOpen]) // Re-run when modal opens

  const validateKey = async (key: string) => {
    if (!key) {
      setIsKeyValid(false)
      localStorage.setItem("mistral-api-key-valid", "false")
      return false
    }

    setIsValidatingKey(true)
    try {
      const isValid = await validateApiKey(key)
      setIsKeyValid(isValid)
      localStorage.setItem("mistral-api-key-valid", isValid.toString())
      return isValid
    } catch (error) {
      setIsKeyValid(false)
      localStorage.setItem("mistral-api-key-valid", "false")
      return false
    } finally {
      setIsValidatingKey(false)
    }
  }

  const handleSave = async () => {
    // Validate the API key before saving
    if (apiKey) {
      const isValid = await validateKey(apiKey)
      if (!isValid) {
        toast({
          title: "Invalid API Key",
          description: "The API key you provided is not valid. Please check and try again.",
          variant: "destructive",
        })
        return
      }
    } else {
      // If no API key, mark as invalid
      localStorage.setItem("mistral-api-key-valid", "false")
    }

    // Save settings to localStorage
    localStorage.setItem("mistral-api-key", apiKey)
    localStorage.setItem("mistral-model", selectedModel)

    // Trigger a storage event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"))
    }

    toast({
      title: "Settings saved",
      description: "Your API key and model preferences have been saved.",
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="api">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="api">API Settings</TabsTrigger>
            <TabsTrigger value="themes">Themes & Plugins</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">Mistral API Key</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setIsKeyValid(null) // Reset validation when key changes
                    }}
                    placeholder="Enter your Mistral API key"
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isValidatingKey ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isKeyValid === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : isKeyValid === false ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : null}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  type="button"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {isKeyValid === false && (
                <p className="text-sm text-destructive">Invalid API key. Please check your key and try again.</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-fit mt-1"
                onClick={() => validateKey(apiKey)}
                disabled={isValidatingKey || !apiKey}
              >
                {isValidatingKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Key"
                )}
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MISTRAL_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="themes" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Themes</h3>
                <p className="text-sm text-muted-foreground">Customize the appearance of your MiKnow application.</p>

                <div className="grid gap-2 mt-4">
                  <Label htmlFor="theme">Current Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="obsidian">Obsidian</SelectItem>
                      <SelectItem value="nord">Nord</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Import Theme
                  </Button>
                  <Button variant="outline" size="sm">
                    Create Theme
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium">Plugins</h3>
                <p className="text-sm text-muted-foreground">Extend MiKnow's functionality with plugins.</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <h4 className="font-medium">Graph Enhancer</h4>
                      <p className="text-xs text-muted-foreground">
                        Adds advanced visualization options to the graph view.
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Install
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <h4 className="font-medium">Citation Helper</h4>
                      <p className="text-xs text-muted-foreground">
                        Automatically formats and manages citations in your notes.
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Install
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Browse Plugins
                  </Button>
                  <Button variant="outline" size="sm">
                    Develop Plugin
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

