"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Search, ZoomIn, ZoomOut, Network, Loader2, Upload, Info, Plus } from "lucide-react"
import { generateKnowledgeGraph, type GraphData } from "@/lib/ai-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export default function GraphView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [newNote, setNewNote] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if we have saved graph data in localStorage
    const savedGraphData = localStorage.getItem("miknow-graph-data")
    if (savedGraphData) {
      try {
        setGraphData(JSON.parse(savedGraphData))
      } catch (error) {
        console.error("Failed to parse saved graph data:", error)
      }
    }

    // Check if we have saved notes
    const savedNotes = localStorage.getItem("miknow-notes")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error("Failed to parse saved notes:", error)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // If no nodes, show empty state
    if (graphData.nodes.length === 0) {
      ctx.font = "16px Arial"
      ctx.fillStyle = "#666"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(
        "No graph data available. Add notes and generate a knowledge graph.",
        canvas.width / 2,
        canvas.height / 2,
      )
      return
    }

    // Calculate positions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8 * zoomLevel

    // Draw edges
    graphData.edges.forEach((edge) => {
      const sourceNode = graphData.nodes.find((n) => n.id === edge.from)
      const targetNode = graphData.nodes.find((n) => n.id === edge.to)

      if (sourceNode && targetNode) {
        const sourceIndex = graphData.nodes.indexOf(sourceNode)
        const targetIndex = graphData.nodes.indexOf(targetNode)

        const sourceAngle = (sourceIndex / graphData.nodes.length) * Math.PI * 2
        const targetAngle = (targetIndex / graphData.nodes.length) * Math.PI * 2

        const sourceX = centerX + Math.cos(sourceAngle) * radius
        const sourceY = centerY + Math.sin(sourceAngle) * radius
        const targetX = centerX + Math.cos(targetAngle) * radius
        const targetY = centerY + Math.sin(targetAngle) * radius

        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(targetX, targetY)
        ctx.strokeStyle = "#aaa"
        ctx.lineWidth = edge.width || 1
        ctx.stroke()
      }
    })

    // Draw nodes
    graphData.nodes.forEach((node, index) => {
      const angle = (index / graphData.nodes.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      const nodeSize = (node.value || 5) * 5 * zoomLevel

      // Draw node
      ctx.beginPath()
      ctx.arc(x, y, nodeSize, 0, Math.PI * 2)
      ctx.fillStyle = node.color || "#9c27b0"
      ctx.fill()

      // Draw label
      ctx.font = `${12 * zoomLevel}px Arial`
      ctx.fillStyle = "#000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Highlight if matches search
      if (searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        ctx.strokeStyle = "#ff5722"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#ff5722"
      }

      ctx.fillText(node.label, x, y + nodeSize + 10)
    })
  }, [graphData, zoomLevel, searchTerm])

  const handleSearch = () => {
    if (!searchTerm) return

    // Highlight nodes that match the search term
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => ({
        ...node,
        color: node.label.toLowerCase().includes(searchTerm.toLowerCase())
          ? "#ff5722"
          : node.color || (node.id.startsWith("note-") ? "#4caf50" : "#9c27b0"),
      })),
    }))
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const updatedNotes = [...notes, newNote.trim()]
    setNotes(updatedNotes)
    setNewNote("")

    // Save to localStorage
    localStorage.setItem("miknow-notes", JSON.stringify(updatedNotes))

    toast({
      title: "Note added",
      description: "Your note has been added to the knowledge base.",
    })
  }

  const handleGenerateGraph = async () => {
    if (notes.length === 0) {
      toast({
        title: "No notes available",
        description: "Please add some notes before generating a knowledge graph.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const newGraphData = await generateKnowledgeGraph(notes)
      setGraphData(newGraphData)

      // Save to localStorage
      localStorage.setItem("miknow-graph-data", JSON.stringify(newGraphData))

      toast({
        title: "Graph generated",
        description: `Generated a knowledge graph with ${newGraphData.nodes.length} nodes and ${newGraphData.edges.length} edges.`,
      })
    } catch (error) {
      toast({
        title: "Failed to generate graph",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string

        // Try to parse as JSON first (for graph data)
        try {
          const jsonData = JSON.parse(content)

          // Check if it's graph data
          if (jsonData.nodes && jsonData.edges) {
            setGraphData(jsonData)
            localStorage.setItem("miknow-graph-data", content)

            toast({
              title: "Graph imported",
              description: `Imported a knowledge graph with ${jsonData.nodes.length} nodes and ${jsonData.edges.length} edges.`,
            })
            return
          }
        } catch (e) {
          // Not JSON, treat as text
        }

        // Treat as text file with notes
        const lines = content.split(/\r?\n/).filter((line) => line.trim())
        if (lines.length > 0) {
          setNotes(lines)
          localStorage.setItem("miknow-notes", JSON.stringify(lines))

          toast({
            title: "Notes imported",
            description: `Imported ${lines.length} notes from the file.`,
          })
        } else {
          throw new Error("No valid content found in the file")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Failed to parse the imported file",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Failed to read the file",
        variant: "destructive",
      })
      setIsLoading(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Knowledge Graph
          </CardTitle>
          <CardDescription>
            Visualize the connections between your notes and explore your knowledge network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 ml-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json,.txt,.md"
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import
              </Button>

              <Button variant="outline" onClick={handleGenerateGraph} disabled={isGenerating || notes.length === 0}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Network className="mr-2 h-4 w-4" />
                )}
                Generate Graph
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Add Notes</h3>
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Enter a note or concept to add to your knowledge graph..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>

              {notes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Your Notes ({notes.length})</h3>
                  <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
                    <ul className="space-y-1">
                      {notes.map((note, index) => (
                        <li key={index} className="text-sm">
                          {note.length > 50 ? note.substring(0, 50) + "..." : note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Knowledge Graph</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <Slider
                    id="zoom"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[zoomLevel]}
                    onValueChange={(value) => setZoomLevel(value[0])}
                    className="w-24"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-white dark:bg-zinc-800 h-[300px]">
                <canvas ref={canvasRef} className="w-full h-full" style={{ touchAction: "none" }} />
              </div>

              {graphData.nodes.length === 0 && (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Add notes and generate a graph to visualize connections between concepts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {graphData.nodes.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Graph Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9c27b0]"></div>
                  <span className="text-xs">Note Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#673ab7]"></div>
                  <span className="text-xs">Link Suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3f51b5]"></div>
                  <span className="text-xs">Q&A</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2196f3]"></div>
                  <span className="text-xs">Graph View</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#03a9f4]"></div>
                  <span className="text-xs">Note Generation</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

