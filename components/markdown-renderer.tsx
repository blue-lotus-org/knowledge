"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import { useTheme } from "next-themes"

// Dynamically import plugins
const RemarkMath = dynamic(() => import("remark-math"), { ssr: false })
const RemarkGfm = dynamic(() => import("remark-gfm"), { ssr: false })
const RehypeKatex = dynamic(() => import("rehype-katex"), { ssr: false })

// Dynamically import the syntax highlighter components
const SyntaxHighlighter = dynamic(() => import("react-syntax-highlighter").then((mod) => mod.Prism), { ssr: false })

// Dynamically import the style
const CodeStyle = dynamic(
  () => import("react-syntax-highlighter/dist/cjs/styles/prism").then((mod) => mod.vscDarkPlus),
  { ssr: false },
)

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const [codeStyle, setCodeStyle] = useState<any>(null)
  const [plugins, setPlugins] = useState<{ remark: any[]; rehype: any[] }>({ remark: [], rehype: [] })
  const [isKatexLoaded, setIsKatexLoaded] = useState(false)

  // Load the style and plugins once the component mounts
  useEffect(() => {
    // Load syntax highlighter style
    import("react-syntax-highlighter/dist/cjs/styles/prism").then((mod) => {
      setCodeStyle(mod.vscDarkPlus)
    })

    // Load KaTeX CSS
    const loadKatexCSS = async () => {
      try {
        // Create a link element for KaTeX CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
        link.onload = () => setIsKatexLoaded(true)
        document.head.appendChild(link)
      } catch (error) {
        console.error("Failed to load KaTeX CSS:", error)
      }
    }
    loadKatexCSS()

    // Load plugins
    Promise.all([import("remark-math"), import("remark-gfm"), import("rehype-katex")])
      .then(([remarkMath, remarkGfm, rehypeKatex]) => {
        setPlugins({
          remark: [remarkMath.default, remarkGfm.default],
          rehype: [rehypeKatex.default],
        })
      })
      .catch((error) => {
        console.error("Failed to load markdown plugins:", error)
        // Set basic plugins if there's an error
        setPlugins({
          remark: [],
          rehype: [],
        })
      })
  }, [])

  return (
    <div className={`markdown-content ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={plugins.remark}
        rehypePlugins={plugins.rehype}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")

            if (!inline && match && SyntaxHighlighter && codeStyle) {
              return (
                <SyntaxHighlighter style={codeStyle} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          // Custom rendering for tables
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-border" {...props} />
              </div>
            )
          },
          thead({ node, ...props }) {
            return <thead className="bg-muted" {...props} />
          },
          tbody({ node, ...props }) {
            return <tbody className="divide-y divide-border" {...props} />
          },
          tr({ node, ...props }) {
            return <tr className="transition-colors hover:bg-muted/50" {...props} />
          },
          th({ node, ...props }) {
            return <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" {...props} />
          },
          td({ node, ...props }) {
            return <td className="px-4 py-2 whitespace-nowrap text-sm" {...props} />
          },
          // Custom rendering for blockquotes
          blockquote({ node, ...props }) {
            return <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
          },
          // Custom rendering for links
          a({ node, ...props }) {
            return <a className="obsidian-link" {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

