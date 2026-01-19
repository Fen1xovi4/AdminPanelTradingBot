import { LayoutDashboard, Bot, Settings, BarChart3 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
    },
    {
      icon: Bot,
      label: 'Bots',
      path: '/bots',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
    },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="hidden md:block w-64 modern-sidebar min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3
                    ${active ? 'modern-nav-item active' : 'modern-nav-item text-muted-foreground'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-6 px-4 space-y-4">
          <div className="stat-card">
            <div className="text-xs font-medium text-muted-foreground mb-1">Active Bots</div>
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-xs text-muted-foreground mt-1">Running now</div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-medium text-muted-foreground mb-1">Total Profit</div>
            <div className="text-2xl font-bold text-green-600">$0.00</div>
            <div className="text-xs text-muted-foreground mt-1">All time</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
