"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Info, Download, Save, Copy, Palette } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ThemeEditorProps {
  isOpen: boolean
  onClose: () => void
  initialTheme?: ThemeData
}

interface ColorVariable {
  name: string
  value: string
  description: string
}

interface ThemeData {
  name: string
  author: string
  description: string
  colors: Record<string, string>
}

const DEFAULT_THEME: ThemeData = {
  name: "New Theme",
  author: "",
  description: "A custom theme for MiKnow",
  colors: {
    "--background": "0 0% 100%",
    "--foreground": "240 10% 3.9%",
    "--card": "0 0% 100%",
    "--card-foreground": "240 10% 3.9%",
    "--popover": "0 0% 100%",
    "--popover-foreground": "240 10% 3.9%",
    "--primary": "262.1 83.3% 57.8%",
    "--primary-foreground": "210 20% 98%",
    "--secondary": "240 4.8% 95.9%",
    "--secondary-foreground": "240 5.9% 10%",
    "--muted": "240 4.8% 95.9%",
    "--muted-foreground": "240 3.8% 46.1%",
    "--accent": "240 4.8% 95.9%",
    "--accent-foreground": "240 5.9% 10%",
    "--destructive": "0 84.2% 60.2%",
    "--destructive-foreground": "0 0% 98%",
    "--border": "240 5.9% 90%",
    "--input": "240 5.9% 90%",
    "--ring": "262.1 83.3% 57.8%",
  },
}

const COLOR_DESCRIPTIONS: Record<string, string> = {
  "--background": "Main background color of the application",
  "--foreground": "Main text color on the background",
  "--card": "Background color for card components",
  "--card-foreground": "Text color for card components",
  "--popover": "Background color for popover components",
  "--popover-foreground": "Text color for popover components",
  "--primary": "Primary brand color for buttons and interactive elements",
  "--primary-foreground": "Text color on primary-colored elements",
  "--secondary": "Secondary color for less prominent elements",
  "--secondary-foreground": "Text color on secondary-colored elements",
  "--muted": "Muted background color for subtle UI elements",
  "--muted-foreground": "Text color on muted backgrounds",
  "--accent": "Accent color for highlighting elements",
  "--accent-foreground": "Text color on accent-colored elements",
  "--destructive": "Color for destructive actions like delete",
  "--destructive-foreground": "Text color on destructive elements",
  "--border": "Color for borders and dividers",
  "--input": "Border color for input elements",
  "--ring": "Focus ring color for interactive elements",
}

export default function ThemeEditor({ isOpen, onClose, initialTheme }: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeData>(initialTheme || DEFAULT_THEME)
  const [cssPreview, setCssPreview] = useState("")
  const [activeTab, setActiveTab] = useState("editor")
  const { toast } = useToast()

  useEffect(() => {
    // Generate CSS preview
    let css = `:root {\n`
    Object.entries(theme.colors).forEach(([name, value]) => {
      css += `  ${name}: ${value};\n`
    })
    css += `}\n\n`

    css += `.dark {\n`
    Object.entries(theme.colors).forEach(([name, value]) => {
      // For dark mode, we could invert or adjust the colors
      // This is a simple example - you might want a more sophisticated transformation
      css += `  ${name}: ${value};\n`
    })
    css += `}`

    setCssPreview(css)
  }, [theme])

  const handleColorChange = (name: string, value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [name]: value,
      },
    }))
  }

  const handleMetadataChange = (field: keyof ThemeData, value: string) => {
    setTheme((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveTheme = () => {
    // In a real app, this would save to a database or file
    // For now, we'll just save to localStorage
    const savedThemes = JSON.parse(localStorage.getItem("miknow-themes") || "[]")
    const themeExists = savedThemes.findIndex((t: ThemeData) => t.name === theme.name) >= 0

    if (themeExists) {
      const updatedThemes = savedThemes.map((t: ThemeData) => (t.name === theme.name ? theme : t))
      localStorage.setItem("miknow-themes", JSON.stringify(updatedThemes))
    } else {
      localStorage.setItem("miknow-themes", JSON.stringify([...savedThemes, theme]))
    }

    toast({
      title: "Theme saved",
      description: `Theme "${theme.name}" has been saved.`,
    })
  }

  const handleExportTheme = () => {
    const themeJson = JSON.stringify(theme, null, 2)
    const blob = new Blob([themeJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Theme exported",
      description: `Theme "${theme.name}" has been exported as JSON.`,
    })
  }

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(cssPreview)
    toast({
      title: "CSS copied",
      description: "Theme CSS has been copied to clipboard.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Editor
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Metadata</CardTitle>
                <CardDescription>Basic information about your theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-name">Theme Name</Label>
                    <Input
                      id="theme-name"
                      value={theme.name}
                      onChange={(e) => handleMetadataChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme-author">Author</Label>
                    <Input
                      id="theme-author"
                      value={theme.author}
                      onChange={(e) => handleMetadataChange("author", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-description">Description</Label>
                  <Textarea
                    id="theme-description"
                    value={theme.description}
                    onChange={(e) => handleMetadataChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Variables</CardTitle>
                <CardDescription>Customize the colors of your theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(theme.colors).map(([name, value]) => (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`color-${name}`} className="text-xs font-mono">
                          {name}
                        </Label>
                        <span className="text-xs text-muted-foreground">{COLOR_DESCRIPTIONS[name] || ""}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: `hsl(${value})` }} />
                        <Input
                          id={`color-${name}`}
                          value={value}
                          onChange={(e) => handleColorChange(name, e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleExportTheme}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Theme
                </Button>
                <Button onClick={handleSaveTheme}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Theme
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>CSS Preview</CardTitle>
                <CardDescription>Generated CSS for your theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={handleCopyCSS}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto font-mono text-sm">{cssPreview}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Preview</CardTitle>
                <CardDescription>See how your theme looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <style dangerouslySetInnerHTML={{ __html: cssPreview }} />
                  <div
                    className="p-4 rounded-md border"
                    style={{
                      backgroundColor: `hsl(${theme.colors["--background"]})`,
                      color: `hsl(${theme.colors["--foreground"]})`,
                      borderColor: `hsl(${theme.colors["--border"]})`,
                    }}
                  >
                    <h3 className="text-lg font-bold mb-2">Background & Text</h3>
                    <p>This is how your main content will look.</p>
                  </div>

                  <div
                    className="p-4 rounded-md"
                    style={{
                      backgroundColor: `hsl(${theme.colors["--card"]})`,
                      color: `hsl(${theme.colors["--card-foreground"]})`,
                      border: `1px solid hsl(${theme.colors["--border"]})`,
                    }}
                  >
                    <h3 className="text-lg font-bold mb-2">Card Component</h3>
                    <p>This is how cards will appear in your theme.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor: `hsl(${theme.colors["--primary"]})`,
                        color: `hsl(${theme.colors["--primary-foreground"]})`,
                      }}
                    >
                      Primary Button
                    </button>

                    <button
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor: `hsl(${theme.colors["--secondary"]})`,
                        color: `hsl(${theme.colors["--secondary-foreground"]})`,
                      }}
                    >
                      Secondary Button
                    </button>

                    <button
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor: `hsl(${theme.colors["--accent"]})`,
                        color: `hsl(${theme.colors["--accent-foreground"]})`,
                      }}
                    >
                      Accent Button
                    </button>

                    <button
                      className="px-4 py-2 rounded-md"
                      style={{
                        backgroundColor: `hsl(${theme.colors["--destructive"]})`,
                        color: `hsl(${theme.colors["--destructive-foreground"]})`,
                      }}
                    >
                      Destructive Button
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Development Guide</CardTitle>
                <CardDescription>Learn how to create effective themes for MiKnow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Themes in MiKnow use CSS variables with HSL color values for maximum flexibility.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Understanding HSL Colors</h3>
                    <p className="text-sm text-muted-foreground">
                      HSL stands for Hue, Saturation, and Lightness. The format is "H S% L%" where:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>Hue</strong>: A number from 0 to 360 representing the color wheel (0/360 is red, 120 is
                        green, 240 is blue)
                      </li>
                      <li>
                        <strong>Saturation</strong>: A percentage where 0% is grayscale and 100% is full color
                      </li>
                      <li>
                        <strong>Lightness</strong>: A percentage where 0% is black and 100% is white
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Color Relationships</h3>
                    <p className="text-sm text-muted-foreground">
                      When designing a theme, consider these relationships:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Background and foreground colors should have high contrast for readability</li>
                      <li>Primary colors should stand out against the background</li>
                      <li>Secondary and muted colors should be subtle variations of the background</li>
                      <li>Destructive colors should clearly indicate warning/danger (usually red tones)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Testing Your Theme</h3>
                    <p className="text-sm text-muted-foreground">Before finalizing your theme:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Check contrast ratios for accessibility (WCAG recommends at least 4.5:1 for normal text)</li>
                      <li>Test in both light and dark modes</li>
                      <li>Verify readability of all text elements</li>
                      <li>Ensure interactive elements are clearly distinguishable</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Sharing Your Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      You can export your theme as a JSON file and share it with others. They can import it through the
                      Theme Panel.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

