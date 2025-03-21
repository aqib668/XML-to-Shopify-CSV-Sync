import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="fixed top-0 z-30 -ml-2 hidden h-screen w-full shrink-0 border-r md:sticky md:block">
          <SidebarNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

