"use client"

interface BasicMarkdownRendererProps {
  content: string
  className?: string
}

export default function BasicMarkdownRenderer({ content, className }: BasicMarkdownRendererProps) {
  // This is an extremely basic renderer that just formats the text with some minimal styling
  // It doesn't actually parse markdown, just adds some basic formatting

  // Format the content with some basic styling
  const formattedContent = content
    // Replace headers
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gm, "<h4>$1</h4>")
    .replace(/^##### (.*$)/gm, "<h5>$1</h5>")
    .replace(/^###### (.*$)/gm, "<h6>$1</h6>")
    // Replace bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Replace code blocks with simple formatting
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Replace inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Replace links
    .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" class="obsidian-link">$1</a>')
    // Replace lists
    .replace(/^\s*\*\s(.*$)/gm, "<li>$1</li>")
    // Replace paragraphs
    .replace(/^(?!<[a-z])(.*$)/gm, "<p>$1</p>")
    // Replace line breaks
    .replace(/\n/g, "")

  return (
    <div className={`markdown-content ${className || ""}`} dangerouslySetInnerHTML={{ __html: formattedContent }} />
  )
}

