"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LogOut, Bell } from "lucide-react"
import { useState } from "react"

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground shadow-sm border-b border-sidebar-border">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="font-bold text-sidebar-primary-foreground text-lg">ZT</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">SecureBank</h1>
            <p className="text-xs text-sidebar-accent-foreground opacity-70">Admin Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-sidebar-border rounded-lg transition">
            <Bell size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-sidebar-border rounded-lg transition flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center text-sm font-semibold">
                {user?.name.charAt(0)}
              </div>
              <LogOut size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card text-foreground rounded-lg shadow-lg border border-border z-50 py-2">
                <div className="px-4 py-2 border-b border-border text-sm">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-destructive/10 transition flex items-center gap-2 text-destructive"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
