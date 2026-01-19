import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 w-full min-w-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
