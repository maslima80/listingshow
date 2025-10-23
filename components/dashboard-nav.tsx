"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { useLeadCount } from "@/hooks/use-lead-count"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useRef } from "react"

interface DashboardNavProps {
  userName?: string
  teamSlug?: string
}

export function DashboardNav({ userName, teamSlug }: DashboardNavProps) {
  const pathname = usePathname()
  const { toast } = useToast()
  const hasShownToastRef = useRef(false)

  const { count: newLeadsCount } = useLeadCount({
    status: 'new',
    onCountIncrease: (newCount, oldCount) => {
      // Only show toast if we're on dashboard pages and not the first load
      if ((pathname === '/dashboard' || pathname?.startsWith('/dashboard/leads')) && hasShownToastRef.current) {
        toast({
          title: "New lead received!",
          description: `You have ${newCount} new ${newCount === 1 ? 'lead' : 'leads'}.`,
          action: (
            <Link 
              href="/dashboard/leads?status=new"
              className="text-sm font-medium underline underline-offset-4"
            >
              View
            </Link>
          ),
        })
      }
    },
  })

  // Mark that we've loaded at least once (to prevent toast on initial load)
  useEffect(() => {
    if (newLeadsCount >= 0) {
      hasShownToastRef.current = true
    }
  }, [newLeadsCount])

  const displayCount = newLeadsCount > 9 ? '9+' : newLeadsCount.toString()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/dashboard" className="flex-shrink-0">
              <img 
                src="/listin.show new logo.png" 
                alt="Listing.Show" 
                className="h-7 sm:h-8 w-auto cursor-pointer"
              />
            </Link>
            {teamSlug && (
              <div className="hidden sm:block text-xs text-muted-foreground border-l pl-3 ml-1 truncate">
                listing.show/u/{teamSlug}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Bell Icon with Badge */}
            <Link 
              href="/dashboard/leads?status=new"
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={`${newLeadsCount} new leads`}
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {newLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {displayCount}
                </span>
              )}
            </Link>
            
            {userName && (
              <span className="hidden sm:inline text-sm text-slate-600 truncate max-w-[120px]">Welcome, {userName}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
