import Header from "@/components/header"
import Dashboard from "@/components/dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />
      <Dashboard />
    </main>
  )
}

