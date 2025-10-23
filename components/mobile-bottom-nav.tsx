'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, LayoutGrid, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  matchPaths: string[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
    matchPaths: ['/dashboard']
  },
  {
    href: '/dashboard/properties',
    label: 'Properties',
    icon: Building2,
    matchPaths: ['/dashboard/properties']
  },
  {
    href: '/dashboard/hub',
    label: 'Hub',
    icon: LayoutGrid,
    matchPaths: ['/dashboard/hub']
  },
  {
    href: '/dashboard/leads',
    label: 'Leads',
    icon: Inbox,
    matchPaths: ['/dashboard/leads']
  }
]

export function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    // Exact match for home
    if (item.href === '/dashboard') {
      return pathname === '/dashboard'
    }
    // Prefix match for other routes
    return item.matchPaths.some(path => pathname?.startsWith(path))
  }

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
      style={{
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-all duration-200',
                active 
                  ? 'text-slate-900' 
                  : 'text-slate-500 hover:text-slate-700 active:scale-95'
              )}
            >
              <Icon 
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  active && 'scale-110'
                )} 
              />
              <span 
                className={cn(
                  'text-[11px] font-medium transition-all duration-200',
                  active && 'font-semibold'
                )}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-900 rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
