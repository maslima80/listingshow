"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, User, Settings, CreditCard, Palette, LogOut } from "lucide-react"
import { useLeadCount } from "@/hooks/use-lead-count"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {userName && (
                    <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {userName.split(' ')[0]}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userName || 'User'}</p>
                    {teamSlug && (
                      <p className="text-xs text-muted-foreground">listing.show/u/{teamSlug}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/branding" className="cursor-pointer">
                    <Palette className="mr-2 h-4 w-4" />
                    Branding
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing (Coming Soon)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
