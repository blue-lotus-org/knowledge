"use client"

import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Settings, Palette } from "lucide-react"
import SettingsModal from "@/components/settings-modal"
import ThemePanel from "@/components/theme-panel"
import { useTheme } from "next-themes"

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-md bg-primary/10 p-1 w-8 h-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2" />
              <path d="M8 17h2" />
              <path d="M14 13h2" />
              <path d="M14 17h2" />
            </svg>
          </div>
          <span className="font-bold text-lg">MiKnow</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsThemePanelOpen(true)} aria-label="Theme & Plugins">
            <Palette className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ThemePanel isOpen={isThemePanelOpen} onClose={() => setIsThemePanelOpen(false)} />
    </header>
  )
}

