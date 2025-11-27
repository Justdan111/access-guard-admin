"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Shield, Users, AlertTriangle, Settings } from "lucide-react"

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Shield, label: "Risk Management", href: "/admin/risk" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: AlertTriangle, label: "Incidents", href: "/admin/incidents" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <nav className="flex-1 p-6 space-y-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-border"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-sidebar-border space-y-4">
        <div>
          <p className="text-xs font-semibold text-sidebar-accent-foreground opacity-70 mb-2">SYSTEM STATUS</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span>API Health</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Database</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
