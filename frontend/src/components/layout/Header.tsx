import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, User, Activity } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
            Bots For Trading
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">({user.role})</span>
          </div>
          {/* Mobile: just show icon button */}
          <div className="sm:hidden flex items-center">
            <div className="p-2 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="px-2 sm:px-3">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
