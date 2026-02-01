import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-paper-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Main Content */}
          <main>{children}</main>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 text-center text-sm text-gray-500">
        <p>Your Personal News Aggregator</p>
        <p className="mt-1">
          Powered by Medium RSS & Perplexity AI
        </p>
      </footer>
    </div>
  )
}
