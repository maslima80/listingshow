"use client"

import { DashboardNav } from "./dashboard-nav"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { Toaster } from "./ui/toaster"

interface DashboardClientWrapperProps {
  userName?: string
  teamSlug?: string
  children: React.ReactNode
}

export function DashboardClientWrapper({ userName, teamSlug, children }: DashboardClientWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <DashboardNav userName={userName} teamSlug={teamSlug} />
      <div className="pb-16 lg:pb-0">
        {children}
      </div>
      <MobileBottomNav />
      <Toaster />
    </div>
  )
}
