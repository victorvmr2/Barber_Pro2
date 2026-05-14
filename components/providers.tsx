'use client'

import { ReactNode } from 'react'
import { AppProvider } from '@/lib/app-context'
import { ToastProvider } from '@/components/ui/toast-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AppProvider>
  )
}
