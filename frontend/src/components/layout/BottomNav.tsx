import { LayoutDashboard, Bot, Settings, BarChart3 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export function BottomNav() {
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 h-full
                transition-colors
                ${active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-xs ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
