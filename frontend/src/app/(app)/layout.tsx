"use client"

import { Shield, Activity, List, AlertTriangle, Route, DollarSign, Users, CheckSquare, Search, Bell, Play } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[hsl(var(--border))] flex flex-col bg-[#0a0a0a]">
        <div className="h-14 flex items-center px-6 border-b border-[hsl(var(--border))] font-semibold text-lg tracking-tight">
          <Shield className="mr-2 h-5 w-5 text-indigo-500" />
          Sentinel
        </div>
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Control Tower</div>
          <nav className="space-y-1 px-2">
            <NavItem href="/dashboard" icon={<Activity className="h-4 w-4" />} label="Overview" />
            <NavItem href="/live" icon={<Activity className="h-4 w-4" />} label="Live Traffic" />
            <NavItem href="/traces" icon={<List className="h-4 w-4" />} label="Traces" />
            <NavItem href="/incidents" icon={<AlertTriangle className="h-4 w-4" />} label="Incidents" />
            <NavItem href="/risk" icon={<Shield className="h-4 w-4" />} label="Risk Explorer" />
            <NavItem href="/routes" icon={<Route className="h-4 w-4" />} label="Routes" />
            <NavItem href="/cost" icon={<DollarSign className="h-4 w-4" />} label="Models & Cost" />
            <NavItem href="/responsibility" icon={<Users className="h-4 w-4" />} label="Responsibility" />
            <NavItem href="/queue" icon={<CheckSquare className="h-4 w-4" />} label="Review Queue" />
          </nav>
          <div className="px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 mt-6">System</div>
          <nav className="space-y-1 px-2">
            <NavItem href="/playground" icon={<Play className="h-4 w-4" />} label="Playground" />
          </nav>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-[hsl(var(--border))] flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <input 
                type="text" 
                placeholder="Search traces, incidents... (Cmd+K)" 
                className="w-full bg-[hsl(var(--accent))] border-none rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md font-medium tracking-wide">DEMO ENVIRONMENT</span>
            <Bell className="h-5 w-5 text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--foreground))]" />
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-sm font-medium border border-[hsl(var(--border))]">
              JS
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-[#050505]">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_2px_0_0_0_rgb(99,102,241)]' 
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
      }`}
    >
      <div className={`${isActive ? 'text-indigo-400' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  )
}
