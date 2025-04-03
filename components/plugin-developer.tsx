"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Info, Download, Save, Copy, Package, Play, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PluginDeveloperProps {
  isOpen: boolean
  onClose: () => void
  initialPlugin?: PluginData
}

interface PluginData {
  name: string
  author: string
  description: string
  version: string
  type: "visualization" | "analysis" | "integration" | "utility"
  code: string
}

const DEFAULT_PLUGIN: PluginData = {
  name: "New Plugin",
  author: "",
  description: "A custom plugin for MiKnow",
  version: "0.1.0",
  type: "utility",
  code: `// MiKnow Plugin Template
// This is a basic plugin template to get you started

// Plugin metadata is defined in the plugin manifest
// You can access it via this.metadata

class MiKnowPlugin {
  constructor() {
    // Initialize your plugin here
    console.log("Plugin initialized:", this.metadata.name);
  }

  // Required: This method is called when the plugin is activated
  activate() {
    // Add your plugin's functionality here
    console.log("Plugin activated:", this.metadata.name);
    
    // Return any UI components or hooks your plugin provides
    return {
      // Example: Add a custom menu item
      menuItems: [
        {
          id: "example-action",
          label: "Example Action",
          onClick: () => this.exampleAction()
        }
      ],
      
      // Example: Register event handlers
      eventHandlers: {
        "note:created": this.onNoteCreated.bind(this),
        "note:updated": this.onNoteUpdated.bind(this)
      }
    };
  }

  // Required: This method is called when the plugin is deactivated
  deactivate() {
    // Clean up any resources your plugin uses
    console.log("Plugin deactivated:", this.metadata.name);
  }

  // Example custom method
  exampleAction() {
    console.log("Example action executed");
    // Your custom functionality here
  }

  // Example event handlers
  onNoteCreated(note) {
    console.log("Note created:", note.title);
  }

  // Example event handlers
  onNoteUpdated(note) {
    console.log("Note updated:", note.title);
  }
}

// Export the plugin class
export default MiKnowPlugin;
`,
}

const PLUGIN_TEMPLATES = {
  visualization: `// MiKnow Visualization Plugin Template

class VisualizationPlugin {
  constructor() {
    console.log("Visualization Plugin initialized:", this.metadata.name);
  }

  activate() {
    console.log("Visualization Plugin activated");
    
    return {
      // Register a custom visualization component
      visualizations: [
        {
          id: "custom-graph",
          name: "Custom Graph",
          component: this.renderGraph.bind(this)
        }
      ],
      
      // Add settings for the visualization
      settings: [
        {
          id: "show-labels",
          label: "Show Labels",
          type: "boolean",
          default: true
        },
        {
          id: "node-size",
          label: "Node Size",
          type: "number",
          default: 5,
          min: 1,
          max: 10
        }
      ]
    };
  }

  deactivate() {
    console.log("Visualization Plugin deactivated");
  }

  // This function would return a React component in a real implementation
  renderGraph(container, data, options) {
    console.log("Rendering custom graph with data:", data);
    console.log("Using options:", options);
    
    // In a real plugin, you would render a visualization here
    // For example, using D3.js, Chart.js, or a custom canvas implementation
    container.innerHTML = \`
      <div style="padding: 20px; text-align: center;">
        <h3>Custom Visualization</h3>
        <p>Displaying \${data.nodes.length} nodes and \${data.edges.length}</p>
        <div id="graph-container" style="height: 300px; border: 1px solid #ccc;"></div>
      </div>
    \`;
    
    // Simulate rendering a graph
    const graphContainer = container.querySelector("#graph-container");
    // In a real plugin, you would initialize your visualization library here
  }
}

export default VisualizationPlugin;
`,
  analysis: `// MiKnow Analysis Plugin Template

class AnalysisPlugin {
  constructor() {
    console.log("Analysis Plugin initialized:", this.metadata.name);
  }

  activate() {
    console.log("Analysis Plugin activated");
    
    return {
      // Register analysis tools
      analysisTools: [
        {
          id: "custom-analyzer",
          name: "Custom Analyzer",
          description: "Analyzes notes using custom algorithms",
          analyze: this.analyzeNote.bind(this)
        }
      ],
      
      // Add a custom tab to the analysis view
      uiComponents: [
        {
          type: "tab",
          location: "analysis",
          id: "custom-analysis",
          label: "Custom Analysis",
          component: this.renderAnalysisTab.bind(this)
        }
      ]
    };
  }

  deactivate() {
    console.log("Analysis Plugin deactivated");
  }

  // Custom analysis function
  async analyzeNote(noteContent) {
    console.log("Analyzing note:", noteContent.substring(0, 50) + "...");
    
    // In a real plugin, you would implement your analysis algorithm here
    // This could use NLP, pattern matching, or other techniques
    
    // Simulate an analysis result
    return {
      score: Math.random() * 100,
      entities: ["example", "analysis", "plugin"],
      sentiment: "positive",
      customMetrics: {
        complexity: Math.random() * 10,
        clarity: Math.random() * 10
      }
    };
  }

  // This function would return a React component in a real implementation
  renderAnalysisTab(container) {
    container.innerHTML = \`
      <div style="padding: 20px;">
        <h3>Custom Analysis</h3>
        <p>This tab provides custom analysis tools for your notes.</p>
        <button id="analyze-button">Analyze Current Note</button>
        <div id="results-container" style="margin-top: 20px;"></div>
      </div>
    \`;
    
    // Add event listeners
    const analyzeButton = container.querySelector("#analyze-button");
    analyzeButton.addEventListener("click", () => {
      const resultsContainer = container.querySelector("#results-container");
      resultsContainer.innerHTML = "<p>Analyzing...</p>";
      
      // In a real plugin, you would get the current note and analyze it
      setTimeout(() => {
        resultsContainer.innerHTML = \`
          <div style="border: 1px solid #ccc; padding: 10px; border-radius: 4px;">
            <h4>Analysis Results</h4>
            <p>Complexity: 7.2/10</p>
            <p>Clarity: 8.5/10</p>
            <p>Key topics: research, knowledge management, notes</p>
          </div>
        \`;
      }, 1000);
    });
  }
}

export default AnalysisPlugin;
`,
  integration: `// MiKnow Integration Plugin Template

class IntegrationPlugin {
  constructor() {
    console.log("Integration Plugin initialized:", this.metadata.name);
    this.api = null;
  }

  activate() {
    console.log("Integration Plugin activated");
    
    // Initialize API connection
    this.initializeApi();
    
    return {
      // Add integration-specific commands
      commands: [
        {
          id: "sync-notes",
          name: "Sync Notes",
          shortcut: "Ctrl+Shift+S",
          callback: this.syncNotes.bind(this)
        },
        {
          id: "import-from-service",
          name: "Import from Service",
          callback: this.importFromService.bind(this)
        }
      ],
      
      // Add settings for the integration
      settings: [
        {
          id: "api-key",
          label: "API Key",
          type: "password",
          default: ""
        },
        {
          id: "auto-sync",
          label: "Auto Sync",
          type: "boolean",
          default: false
        }
      ],
      
      // Add a custom sidebar component
      uiComponents: [
        {
          type: "sidebar",
          id: "integration-sidebar",
          label: "Integration",
          icon: "cloud",
          component: this.renderSidebar.bind(this)
        }
      ]
    };
  }

  deactivate() {
    console.log("Integration Plugin deactivated");
    // Clean up API connection
    this.disconnectApi();
  }

  // Initialize API connection
  async initializeApi() {
    console.log("Initializing API connection");
    
    // In a real plugin, you would initialize your API client here
    // For example, connecting to Notion, Evernote, or another service
    
    this.api = {
      isConnected: true,
      sync: async () => {
        console.log("Syncing with external service");
        return { added: 5, updated: 3, deleted: 0 };
      },
      import: async () => {
        console.log("Importing from external service");
        return { imported: 10 };
      }
    };
  }

  // Clean up API connection
  disconnectApi() {
    console.log("Disconnecting API");
    this.api = null;
  }

  // Sync notes with external service
  async syncNotes() {
    if (!this.api || !this.api.isConnected) {
      console.error("API not connected");
      return { error: "API not connected" };
    }
    
    try {
      const result = await this.api.sync();
      console.log("Sync result:", result);
      return result;
    } catch (error) {
      console.error("Sync error:", error);
      return { error: error.message };
    }
  }

  // Import notes from external service
  async importFromService() {
    if (!this.api || !this.api.isConnected) {
      console.error("API not connected");
      return { error: "API not connected" };
    }
    
    try {
      const result = await this.api.import();
      console.log("Import result:", result);
      return result;
    } catch (error) {
      console.error("Import error:", error);
      return { error: error.message };
    }
  }

  // This function would return a React component in a real implementation
  renderSidebar(container) {
    container.innerHTML = \`
      <div style="padding: 10px;">
        <h3>Integration Status</h3>
        <p>Status: Connected</p>
        <button id="sync-button">Sync Now</button>
        <button id="import-button">Import</button>
        <div id="status-container" style="margin-top: 10px;"></div>
      </div>
    \`;
    
    // Add event listeners
    const syncButton = container.querySelector("#sync-button");
    syncButton.addEventListener("click", async () => {
      const statusContainer = container.querySelector("#status-container");
      statusContainer.innerHTML = "<p>Syncing...</p>";
      
      const result = await this.syncNotes();
      if (result.error) {
        statusContainer.innerHTML = \`<p style="color: red;">Error: \${result.error}</p>\`;
      } else {
        statusContainer.innerHTML = \`
          <p>Sync complete!</p>
          <p>Added: \${result.added}, Updated: \${result.updated}, Deleted: \${result.deleted}</p>
        \`;
      }
    });

    const importButton = container.querySelector("#import-button");
    importButton.addEventListener("click", async () => {
      const statusContainer = container.querySelector("#status-container");
      statusContainer.innerHTML = "<p>Importing...</p>";
      
      const result = await this.importFromService();
      if (result.error) {
        statusContainer.innerHTML = \`<p style="color: red;">Error: \${result.error}</p>\`;
      } else {
        statusContainer.innerHTML = \`
          <p>Import complete!</p>
          <p>Imported: \${result.imported} notes</p>
        \`;
      }
    });
  }
}

export default IntegrationPlugin;
`,
  utility: `// MiKnow Utility Plugin Template

class UtilityPlugin {
  constructor() {
    console.log("Utility Plugin initialized:", this.metadata.name);
  }

  activate() {
    console.log("Utility Plugin activated");
    
    return {
      // Add utility commands
      commands: [
        {
          id: "format-note",
          name: "Format Note",
          shortcut: "Ctrl+Alt+F",
          callback: this.formatNote.bind(this)
        },
        {
          id: "generate-toc",
          name: "Generate Table of Contents",
          callback: this.generateTableOfContents.bind(this)
        }
      ],
      
      // Add context menu items
      contextMenuItems: [
        {
          id: "word-count",
          label: "Word Count",
          location: "note-menu",
          callback: this.countWords.bind(this)
        }
      ],
      
      // Add a toolbar button
      toolbarItems: [
        {
          id: "utility-tools",
          label: "Utility Tools",
          icon: "tool",
          menu: [
            {
              id: "format-note",
              label: "Format Note"
            },
            {
              id: "generate-toc",
              label: "Generate Table of Contents"
            }
          ]
        }
      ]
    };
  }

  deactivate() {
    console.log("Utility Plugin deactivated");
  }

  // Format the current note
  formatNote(noteContent) {
    console.log("Formatting note:", noteContent.substring(0, 50) + "...");
    
    // In a real plugin, you would implement formatting logic here
    // This could include standardizing headings, fixing spacing, etc.
    
    // Simple example: ensure consistent heading format
    let formatted = noteContent;
    
    // Replace inconsistent heading formats
    formatted = formatted.replace(/^#+\\s*(.+)$/gm, (match, title) => {
      // Standardize to "# Title" format
      return \`# \${title.trim()}\`;
    });
    
    // Add spacing after headings
    formatted = formatted.replace(/^(#+\\s*.+)$/gm, "$1\\n\\n");
    
    // Remove multiple blank lines
    formatted = formatted.replace(/\\n{3,}/g, "\\n\\n");
    
    return formatted;
  }

  // Generate a table of contents for the note
  generateTableOfContents(noteContent) {
    console.log("Generating table of contents");
    
    // Extract headings
    const headings = [];
    const headingRegex = /^(#+)\\s+(.+)$/gm;
    let match;
    
    while ((match = headingRegex.exec(noteContent)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const anchor = title.toLowerCase().replace(/[^\\w\\s-]/g, "").replace(/\\s+/g, "-");
      
      headings.push({ level, title, anchor });
    }
    
    // Generate TOC markdown
    let toc = "# Table of Contents\\n\\n";
    
    headings.forEach(heading => {
      const indent = "  ".repeat(heading.level - 1);
      toc += \`\${indent}- [\${heading.title}](#\${heading.anchor})\\n\`;
    });
    
    return toc;
  }

  // Count words in the note
  countWords(noteContent) {
    console.log("Counting words");
    
    // Remove markdown formatting for more accurate count
    const plainText = noteContent
      .replace(/\`\`\`[\\s\\S]*?\`\`\`/g, "") // Remove code blocks
      .replace(/\`[^\`]*\`/g, "") // Remove inline code
      .replace(/\\[([^\\]]*)\\]\$$[^)]*\$$/g, "$1") // Replace links with just the text
      .replace(/[#*_~]/g, ""); // Remove formatting characters
    
    const words = plainText.trim().split(/\\s+/).filter(word => word.length > 0);
    
    return {
      words: words.length,
      characters: plainText.length,
      charactersNoSpaces: plainText.replace(/\\s/g, "").length
    };
  }
}

export default UtilityPlugin;
`,
}

export default function PluginDeveloper({ isOpen, onClose, initialPlugin }: PluginDeveloperProps) {
  const [plugin, setPlugin] = useState<PluginData>(initialPlugin || DEFAULT_PLUGIN)
  const [activeTab, setActiveTab] = useState("editor")
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMetadataChange = (field: keyof PluginData, value: string) => {
    setPlugin((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCodeChange = (value: string) => {
    setPlugin((prev) => ({
      ...prev,
      code: value,
    }))
  }

  const handleTemplateChange = (type: PluginData["type"]) => {
    if (type !== plugin.type) {
      // Ask for confirmation if code has been modified from the default
      if (plugin.code !== DEFAULT_PLUGIN.code && plugin.code !== PLUGIN_TEMPLATES[plugin.type]) {
        if (
          typeof window !== "undefined" &&
          !window.confirm("Changing the template will replace your current code. Are you sure?")
        ) {
          return
        }
      }

      setPlugin((prev) => ({
        ...prev,
        type,
        code: PLUGIN_TEMPLATES[type],
      }))
    }
  }

  const handleSavePlugin = () => {
    // In a real app, this would save to a database or file
    // For now, we'll just save to localStorage
    if (typeof window !== "undefined") {
      const savedPlugins = JSON.parse(localStorage.getItem("miknow-plugins") || "[]")
      const pluginExists = savedPlugins.findIndex((p: PluginData) => p.name === plugin.name) >= 0

      if (pluginExists) {
        const updatedPlugins = savedPlugins.map((p: PluginData) => (p.name === plugin.name ? plugin : p))
        localStorage.setItem("miknow-plugins", JSON.stringify(updatedPlugins))
      } else {
        localStorage.setItem("miknow-plugins", JSON.stringify([...savedPlugins, plugin]))
      }

      toast({
        title: "Plugin saved",
        description: `Plugin "${plugin.name}" has been saved.`,
      })
    }
  }

  const handleExportPlugin = () => {
    if (typeof window !== "undefined") {
      const pluginJson = JSON.stringify(plugin, null, 2)
      const blob = new Blob([pluginJson], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${plugin.name.toLowerCase().replace(/\s+/g, "-")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Plugin exported",
        description: `Plugin "${plugin.name}" has been exported as JSON.`,
      })
    }
  }

  const handleTestPlugin = () => {
    setTestResult(null)
    setTestError(null)

    try {
      // Basic syntax check
      new Function(plugin.code)

      // Check for required methods
      if (!plugin.code.includes("activate") || !plugin.code.includes("deactivate")) {
        throw new Error("Plugin must implement both activate() and deactivate() methods")
      }

      // Simulate plugin execution
      setTestResult("Plugin syntax is valid. Simulating execution...")

      // In a real app, you would load the plugin in a sandbox and test it
      setTimeout(() => {
        setTestResult("Plugin test completed successfully! The plugin appears to be valid.")
      }, 1000)
    } catch (error) {
      setTestError(error instanceof Error ? error.message : "Unknown error")
      toast({
        title: "Plugin test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleCopyCode = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(plugin.code)
      toast({
        title: "Code copied",
        description: "Plugin code has been copied to clipboard.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Plugin Developer
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Metadata</CardTitle>
                <CardDescription>Basic information about your plugin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-name">Plugin Name</Label>
                    <Input
                      id="plugin-name"
                      value={plugin.name}
                      onChange={(e) => handleMetadataChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plugin-author">Author</Label>
                    <Input
                      id="plugin-author"
                      value={plugin.author}
                      onChange={(e) => handleMetadataChange("author", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-version">Version</Label>
                    <Input
                      id="plugin-version"
                      value={plugin.version}
                      onChange={(e) => handleMetadataChange("version", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plugin-type">Type</Label>
                    <Select
                      value={plugin.type}
                      onValueChange={(value) => handleTemplateChange(value as PluginData["type"])}
                    >
                      <SelectTrigger id="plugin-type">
                        <SelectValue placeholder="Select plugin type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visualization">Visualization</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plugin-description">Description</Label>
                  <Textarea
                    id="plugin-description"
                    value={plugin.description}
                    onChange={(e) => handleMetadataChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plugin Code</CardTitle>
                <CardDescription>Write your plugin code here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button variant="ghost" size="sm" className="absolute right-2 top-2 z-10" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={plugin.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="font-mono text-sm min-h-[400px] resize-y"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleExportPlugin}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Plugin
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTestPlugin}>
                    <Play className="mr-2 h-4 w-4" />
                    Test Plugin
                  </Button>
                  <Button onClick={handleSavePlugin}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Plugin
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Test Results</CardTitle>
                <CardDescription>Test your plugin before deploying</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestPlugin}>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </Button>

                {testError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{testError}</AlertDescription>
                  </Alert>
                )}

                {testResult && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{testResult}</AlertDescription>
                  </Alert>
                )}

                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Plugin Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Name:</div>
                    <div>{plugin.name}</div>
                    <div className="font-medium">Type:</div>
                    <div>{plugin.type}</div>
                    <div className="font-medium">Version:</div>
                    <div>{plugin.version}</div>
                    <div className="font-medium">Author:</div>
                    <div>{plugin.author || "Unknown"}</div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Test Environment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    In a real deployment, your plugin would have access to the following APIs:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">MiKnow API</div>
                    <div className="pl-4 text-muted-foreground">
                      Access to notes, graph data, and application features
                    </div>
                    <div className="font-medium">UI Components</div>
                    <div className="pl-4 text-muted-foreground">React components for building custom interfaces</div>
                    <div className="font-medium">Storage API</div>
                    <div className="pl-4 text-muted-foreground">Persistent storage for plugin settings and data</div>
                    <div className="font-medium">Event System</div>
                    <div className="pl-4 text-muted-foreground">
                      Subscribe to application events like note creation/updates
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Development Guide</CardTitle>
                <CardDescription>Learn how to create plugins for MiKnow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Plugins extend MiKnow's functionality with custom features, visualizations, and integrations.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Plugin Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      Every MiKnow plugin must implement these core methods:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>constructor()</strong>: Initialize your plugin
                      </li>
                      <li>
                        <strong>activate()</strong>: Called when the plugin is activated, return UI components and hooks
                      </li>
                      <li>
                        <strong>deactivate()</strong>: Clean up resources when the plugin is deactivated
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Plugin Types</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the right template based on your plugin's purpose:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>Visualization</strong>: Create custom graph visualizations and data displays
                      </li>
                      <li>
                        <strong>Analysis</strong>: Implement custom note analysis algorithms and tools
                      </li>
                      <li>
                        <strong>Integration</strong>: Connect MiKnow with external services and APIs
                      </li>
                      <li>
                        <strong>Utility</strong>: Add helpful tools and commands for working with notes
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Available APIs</h3>
                    <p className="text-sm text-muted-foreground">Your plugin can access these APIs:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>app.notes</strong>: Access and manipulate notes
                      </li>
                      <li>
                        <strong>app.graph</strong>: Access the knowledge graph
                      </li>
                      <li>
                        <strong>app.ui</strong>: Register UI components
                      </li>
                      <li>
                        <strong>app.commands</strong>: Register custom commands
                      </li>
                      <li>
                        <strong>app.events</strong>: Subscribe to application events
                      </li>
                      <li>
                        <strong>app.storage</strong>: Store plugin data persistently
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Always clean up resources in the deactivate() method</li>
                      <li>Use descriptive names for commands and UI components</li>
                      <li>Provide clear error messages and handle exceptions</li>
                      <li>Include settings for customization when appropriate</li>
                      <li>Document your plugin's features and usage</li>
                    </ul>
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

