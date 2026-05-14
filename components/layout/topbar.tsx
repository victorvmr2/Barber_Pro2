'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { useApp } from '@/lib/app-context'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/agendamentos': 'Agendamentos',
  '/fluxo-de-caixa': 'Fluxo de Caixa',
  '/produtos': 'Produtos',
}

export function Topbar() {
  const pathname = usePathname()
  const { logout } = useApp()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-6 lg:px-8">
        <h1 className="text-xl font-serif font-bold text-foreground ml-12 lg:ml-0">
          {pageTitles[pathname] || 'Dashboard'}
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-primary font-medium">{formatTime(currentTime)}</span>
            <span className="text-sm text-muted-foreground capitalize">{formatDate(currentTime)}</span>
          </div>
          {/* Mobile logout button */}
          <button
            onClick={logout}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
