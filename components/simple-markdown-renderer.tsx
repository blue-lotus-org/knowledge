"use client"
import ReactMarkdown from "react-markdown"

interface SimpleMarkdownRendererProps {
  content: string
  className?: string
}

export default function SimpleMarkdownRenderer({ content, className }: SimpleMarkdownRendererProps) {
  // This is a simplified renderer that doesn't use KaTeX or syntax highlighting
  return (
    <div className={`markdown-content ${className || ""}`}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            return (
              <code
                className={match ? `language-${match[1]} bg-muted p-2 rounded block overflow-x-auto` : className}
                {...props}
              >
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
          // Basic handling for math expressions (just display as code)
          math({ node, ...props }) {
            return <code className="bg-muted px-2 py-1 rounded">{props.value}</code>
          },
          inlineMath({ node, ...props }) {
            return <code className="bg-muted px-1 py-0.5 rounded">{props.value}</code>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

