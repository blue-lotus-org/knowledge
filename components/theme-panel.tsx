"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Check, Upload, Plus, PlusCircle, Package, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ThemeEditor from "@/components/theme-editor"
import PluginDeveloper from "@/components/plugin-developer"

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Theme {
  id: string
  name: string
  description: string
  author: string
  preview?: string
  isCustom?: boolean
}

interface Plugin {
  id: string
  name: string
  description: string
  author: string
  installed: boolean
}

const DEFAULT_THEMES: Theme[] = [
  {
    id: "light",
    name: "Light",
    description: "Default light theme",
    author: "MiKnow",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Default dark theme",
    author: "MiKnow",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Inspired by Obsidian.md's default theme",
    author: "MiKnow",
  },
  {
    id: "nord",
    name: "Nord",
    description: "A calm, arctic-inspired theme",
    author: "Community",
  },
  {
    id: "solarized",
    name: "Solarized",
    description: "Ethan Schoonover's Solarized theme",
    author: "Community",
  },
]

const PLUGINS: Plugin[] = [
  {
    id: "graph-enhancer",
    name: "Graph Enhancer",
    description: "Adds advanced visualization options to the graph view",
    author: "MiKnow",
    installed: false,
  },
  {
    id: "citation-helper",
    name: "Citation Helper",
    description: "Automatically formats and manages citations in your notes",
    author: "Community",
    installed: false,
  },
  {
    id: "markdown-extended",
    name: "Markdown Extended",
    description: "Adds additional markdown formatting options",
    author: "Community",
    installed: true,
  },
  {
    id: "obsidian-sync",
    name: "Obsidian Sync",
    description: "Synchronize your notes with Obsidian.md",
    author: "MiKnow",
    installed: false,
  },
]

export default function ThemePanel({ isOpen, onClose }: ThemePanelProps) {
  const { theme, setTheme } = useTheme()
  const [themes, setThemes] = useState<Theme[]>(DEFAULT_THEMES)
  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS)
  const { toast } = useToast()
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false)
  const [isPluginDeveloperOpen, setIsPluginDeveloperOpen] = useState(false)

  // Load custom themes from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedThemes = localStorage.getItem("miknow-themes")
        if (savedThemes) {
          const parsedThemes = JSON.parse(savedThemes)
          // Convert saved themes to the Theme interface format and mark as custom
          const customThemes = parsedThemes.map((theme: any) => ({
            id: theme.name.toLowerCase().replace(/\s+/g, "-"),
            name: theme.name,
            description: theme.description || "Custom theme",
            author: theme.author || "User",
            isCustom: true,
          }))

          // Combine default themes with custom themes, avoiding duplicates
          const combinedThemes = [...DEFAULT_THEMES]

          customThemes.forEach((customTheme: Theme) => {
            // Only add if not already in the list
            if (!combinedThemes.some((t) => t.id === customTheme.id)) {
              combinedThemes.push(customTheme)
            }
          })

          setThemes(combinedThemes)
        }
      } catch (error) {
        console.error("Failed to load custom themes:", error)
      }
    }
  }, [isOpen]) // Reload when panel opens

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
    toast({
      title: "Theme changed",
      description: `Theme has been changed to ${themeId}`,
    })
  }

  const handlePluginToggle = (pluginId: string) => {
    setPlugins(plugins.map((plugin) => (plugin.id === pluginId ? { ...plugin, installed: !plugin.installed } : plugin)))

    const plugin = plugins.find((p) => p.id === pluginId)
    if (plugin) {
      toast({
        title: plugin.installed ? "Plugin disabled" : "Plugin enabled",
        description: `${plugin.name} has been ${plugin.installed ? "disabled" : "enabled"}`,
      })
    }
  }

  const handleImportTheme = () => {
    fileInputRef?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const themeData = JSON.parse(content)

        // Validate theme data
        if (!themeData.name) {
          throw new Error("Invalid theme format: missing name")
        }

        // Save to localStorage
        const savedThemes = JSON.parse(localStorage.getItem("miknow-themes") || "[]")
        const themeExists = savedThemes.findIndex((t: any) => t.name === themeData.name) >= 0

        if (themeExists) {
          const updatedThemes = savedThemes.map((t: any) => (t.name === themeData.name ? themeData : t))
          localStorage.setItem("miknow-themes", JSON.stringify(updatedThemes))
        } else {
          localStorage.setItem("miknow-themes", JSON.stringify([...savedThemes, themeData]))
        }

        // Add to themes list
        const newTheme: Theme = {
          id: themeData.name.toLowerCase().replace(/\s+/g, "-"),
          name: themeData.name,
          description: themeData.description || "Imported theme",
          author: themeData.author || "Unknown",
          isCustom: true,
        }

        // Add to themes if not already present
        setThemes((prev) => {
          if (prev.some((t) => t.id === newTheme.id)) {
            return prev.map((t) => (t.id === newTheme.id ? newTheme : t))
          } else {
            return [...prev, newTheme]
          }
        })

        toast({
          title: "Theme imported",
          description: `${themeData.name} has been imported successfully`,
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Invalid theme file format",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Failed to read the file",
        variant: "destructive",
      })
    }

    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef) {
      fileInputRef.value = ""
    }
  }

  const handleDeleteTheme = (themeId: string) => {
    // Find the theme
    const themeToDelete = themes.find((t) => t.id === themeId)

    if (!themeToDelete || !themeToDelete.isCustom) {
      return // Only allow deleting custom themes
    }

    // Remove from localStorage
    try {
      const savedThemes = JSON.parse(localStorage.getItem("miknow-themes") || "[]")
      const updatedThemes = savedThemes.filter((t: any) => t.name.toLowerCase().replace(/\s+/g, "-") !== themeId)
      localStorage.setItem("miknow-themes", JSON.stringify(updatedThemes))

      // Remove from state
      setThemes((prev) => prev.filter((t) => t.id !== themeId))

      // If the deleted theme was active, switch to light theme
      if (theme === themeId) {
        setTheme("light")
      }

      toast({
        title: "Theme deleted",
        description: `${themeToDelete.name} has been removed`,
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the theme",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Themes & Plugins</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="themes">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="themes">Themes</TabsTrigger>
              <TabsTrigger value="plugins">Plugins</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Available Themes</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={(el) => setFileInputRef(el)}
                    className="hidden"
                    accept=".json,.css"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="sm" onClick={handleImportTheme}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Theme
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsThemeEditorOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Theme
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((themeItem) => (
                  <Card
                    key={themeItem.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      theme === themeItem.id ? "border-primary" : ""
                    }`}
                    onClick={() => handleThemeChange(themeItem.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{themeItem.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {theme === themeItem.id && <Check className="h-4 w-4 text-primary" />}
                          {themeItem.isCustom && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTheme(themeItem.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-xs">By {themeItem.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="h-20 w-full rounded-md bg-secondary mb-2"
                        style={{
                          backgroundImage: themeItem.preview ? `url(${themeItem.preview})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{themeItem.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="plugins" className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Available Plugins</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Browse Plugins
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsPluginDeveloperOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Develop Plugin
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <Card key={plugin.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{plugin.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`plugin-${plugin.id}`} className="sr-only">
                            {plugin.installed ? "Disable" : "Enable"} {plugin.name}
                          </Label>
                          <Switch
                            id={`plugin-${plugin.id}`}
                            checked={plugin.installed}
                            onCheckedChange={() => handlePluginToggle(plugin.id)}
                          />
                        </div>
                      </div>
                      <CardDescription className="text-xs">By {plugin.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{plugin.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {isThemeEditorOpen && <ThemeEditor isOpen={isThemeEditorOpen} onClose={() => setIsThemeEditorOpen(false)} />}

      {isPluginDeveloperOpen && (
        <PluginDeveloper isOpen={isPluginDeveloperOpen} onClose={() => setIsPluginDeveloperOpen(false)} />
      )}
    </>
  )
}

