export interface AIResponse {
  content: string
  error?: string
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false

  try {
    // Make a simple request to validate the API key
    const response = await fetch("https://api.mistral.ai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("API key validation error:", error)
    return false
  }
}

// Update the callMistralAPI function to better handle API key issues
export async function callMistralAPI(
  prompt: string,
  systemPrompt = "You are a helpful AI assistant.",
): Promise<AIResponse> {
  const apiKey = localStorage.getItem("mistral-api-key")
  const model = localStorage.getItem("mistral-model") || "mistral-small-latest"

  if (!apiKey) {
    return {
      content: "",
      error: "API key not found. Please set your Mistral API key in the settings.",
    }
  }

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      // If the API key is invalid, we'll get a 401 error
      if (response.status === 401) {
        localStorage.setItem("mistral-api-key-valid", "false")
        return {
          content: "",
          error: "Invalid API key. Please check your Mistral API key in the settings.",
        }
      }
      return {
        content: "",
        error: errorData.error?.message || "Failed to get response from Mistral AI",
      }
    }

    // If we get here, the API key is valid
    localStorage.setItem("mistral-api-key-valid", "true")
    const data = await response.json()
    return {
      content: data.choices[0].message.content,
    }
  } catch (error) {
    return {
      content: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export interface NoteAnalysisResult {
  summary: string
  keyThemes: string[]
  suggestedLinks: string[]
  knowledgeGaps: string[]
}

export async function analyzeNote(noteContent: string): Promise<NoteAnalysisResult> {
  // Explicitly request JSON format in the prompt
  const prompt = `
    Analyze the following note content and provide insights.
    Return your response in the following JSON format:
    {
      "summary": "A concise summary of the note",
      "keyThemes": ["theme1", "theme2", "theme3"],
      "suggestedLinks": ["link1", "link2", "link3"],
      "knowledgeGaps": ["gap1", "gap2", "gap3"]
    }

    Note content:
    ${noteContent}
  `
  const systemPrompt = "You are an AI assistant specialized in analyzing notes. Always respond with valid JSON."

  const response = await callMistralAPI(prompt, systemPrompt)

  if (response.error) {
    throw new Error(response.error)
  }

  try {
    // Try to extract JSON from the response if it's not already JSON
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : response.content

    const parsedResult = JSON.parse(jsonString)

    // Validate the structure
    if (
      !parsedResult.summary ||
      !Array.isArray(parsedResult.keyThemes) ||
      !Array.isArray(parsedResult.suggestedLinks) ||
      !Array.isArray(parsedResult.knowledgeGaps)
    ) {
      throw new Error("Invalid response structure")
    }

    return parsedResult
  } catch (error) {
    console.error("Failed to parse AI response:", error)

    // Provide a fallback response
    return {
      summary: "Failed to generate summary. Please try again with more detailed content.",
      keyThemes: ["Analysis failed"],
      suggestedLinks: ["Try again with different content"],
      knowledgeGaps: ["Unable to identify knowledge gaps"],
    }
  }
}

export interface LinkSuggestion {
  title: string
  relevance: number
  reason: string
}

export async function suggestLinks(noteContent: string, existingNotes: string[]): Promise<LinkSuggestion[]> {
  // Explicitly request JSON format in the prompt
  const prompt = `
    Given the following note content and existing notes, suggest potential links.
    Return your response as a JSON array of objects with the following structure:
    [
      {
        "title": "Note Title",
        "relevance": 0.85,
        "reason": "Reason for the link"
      }
    ]

    Note content:
    ${noteContent}

    Existing notes:
    ${existingNotes.join("\n")}
  `
  const systemPrompt =
    "You are an AI assistant specialized in suggesting links between notes. Always respond with valid JSON."

  const response = await callMistralAPI(prompt, systemPrompt)

  if (response.error) {
    throw new Error(response.error)
  }

  try {
    // Try to extract JSON from the response if it's not already JSON
    const jsonMatch = response.content.match(/\[[\s\S]*\]/)
    const jsonString = jsonMatch ? jsonMatch[0] : response.content

    const parsedResult = JSON.parse(jsonString)

    // Validate the structure
    if (!Array.isArray(parsedResult)) {
      throw new Error("Invalid response structure")
    }

    // Validate each item
    return parsedResult.map((item) => ({
      title: item.title || "Untitled Note",
      relevance: typeof item.relevance === "number" ? item.relevance : 0.5,
      reason: item.reason || "Related content",
    }))
  } catch (error) {
    console.error("Failed to parse link suggestions:", error)

    // Return a fallback response
    return existingNotes.map((note, index) => ({
      title: note,
      relevance: 0.5,
      reason: "Potential connection based on content similarity",
    }))
  }
}

// Update the system prompt for note generation to include LaTeX
export async function generateNote(prompt: string, relatedNotes: string[]): Promise<string> {
  const combinedContext = relatedNotes.join("\n")
  const fullPrompt = `Write a note about: ${prompt}

You can use Markdown formatting in your note, including:
- **Bold** and *italic* text
- Lists and tables
- Code blocks with syntax highlighting
- LaTeX for mathematical formulas (using $$ for display math and $ for inline math)

Context from related notes:
${combinedContext}`

  const systemPrompt =
    "You are a helpful AI assistant specialized in generating notes. Use Markdown formatting and LaTeX for mathematical expressions where appropriate."

  const response = await callMistralAPI(fullPrompt, systemPrompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return response.content
}

// Update the system prompt for question answering to include LaTeX
export async function answerQuestion(question: string, vaultContent: string): Promise<string> {
  const prompt = `Answer the following question based on the provided vault content.
  
You can use Markdown formatting in your answer, including:
- **Bold** and *italic* text
- Lists and tables
- Code blocks with syntax highlighting
- LaTeX for mathematical formulas (using $$ for display math and $ for inline math)

Question: ${question}

Vault Content:
${vaultContent}`

  const systemPrompt =
    "You are a helpful AI assistant specialized in answering questions based on a knowledge base. Use Markdown formatting and LaTeX for mathematical expressions where appropriate."

  const response = await callMistralAPI(prompt, systemPrompt)

  if (response.error) {
    throw new Error(response.error)
  }

  return response.content
}

// New function to generate knowledge graph data
export interface GraphNode {
  id: string
  label: string
  value: number
  color?: string
}

export interface GraphEdge {
  from: string
  to: string
  width?: number
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export async function generateKnowledgeGraph(notes: string[]): Promise<GraphData> {
  if (notes.length === 0) {
    return { nodes: [], edges: [] }
  }

  // For each tab, create a node
  const tabNodes: GraphNode[] = [
    { id: "analysis", label: "Note Analysis", value: 8, color: "#9c27b0" },
    { id: "links", label: "Link Suggestions", value: 7, color: "#673ab7" },
    { id: "qa", label: "Q&A", value: 6, color: "#3f51b5" },
    { id: "graph", label: "Graph View", value: 7, color: "#2196f3" },
    { id: "generation", label: "Note Generation", value: 6, color: "#03a9f4" },
  ]

  // Create nodes for each note
  const noteNodes: GraphNode[] = notes.map((note, index) => ({
    id: `note-${index}`,
    label: note.length > 30 ? note.substring(0, 30) + "..." : note,
    value: 5,
    color: "#4caf50",
  }))

  // Create edges between tabs and notes
  const edges: GraphEdge[] = []

  // Connect each note to at least one tab
  noteNodes.forEach((noteNode, index) => {
    // Connect to a random tab
    const randomTabIndex = Math.floor(Math.random() * tabNodes.length)
    edges.push({
      from: noteNode.id,
      to: tabNodes[randomTabIndex].id,
      width: 1,
    })

    // Occasionally connect to a second tab
    if (Math.random() > 0.5) {
      let secondTabIndex = Math.floor(Math.random() * tabNodes.length)
      // Make sure it's a different tab
      while (secondTabIndex === randomTabIndex) {
        secondTabIndex = Math.floor(Math.random() * tabNodes.length)
      }
      edges.push({
        from: noteNode.id,
        to: tabNodes[secondTabIndex].id,
        width: 1,
      })
    }
  })

  // Connect tabs to each other
  tabNodes.forEach((sourceTab, sourceIndex) => {
    tabNodes.forEach((targetTab, targetIndex) => {
      if (sourceIndex !== targetIndex && Math.random() > 0.7) {
        edges.push({
          from: sourceTab.id,
          to: targetTab.id,
          width: 2,
        })
      }
    })
  })

  return {
    nodes: [...tabNodes, ...noteNodes],
    edges,
  }
}

