"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Inbox } from "lucide-react"
import { useLeadCount } from "@/hooks/use-lead-count"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

interface Lead {
  id: string
  name: string
  type: 'tour_request' | 'message'
  createdAt: string
  property: {
    title: string
  } | null
}

export function LeadsCard() {
  const { count: newCount } = useLeadCount({ status: 'new' })
  const [lastLead, setLastLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLastLead = async () => {
      try {
        const response = await fetch('/api/leads/list?limit=1')
        const data = await response.json()
        if (data.leads && data.leads.length > 0) {
          setLastLead(data.leads[0])
        }
      } catch (error) {
        console.error('Failed to fetch last lead:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLastLead()
  }, [newCount]) // Refetch when new count changes

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  const getLastInitial = (fullName: string) => {
    const parts = fullName.split(' ')
    return parts.length > 1 ? parts[parts.length - 1][0] + '.' : ''
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-green-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
            <Inbox className="w-6 h-6 text-green-600" />
          </div>
          {newCount > 0 && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              New • {newCount}
            </Badge>
          )}
        </div>
        <CardTitle>Leads</CardTitle>
        <CardDescription>
          Manage tour requests and messages from your properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && lastLead && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Latest</div>
            <div className="text-sm font-medium">
              {getFirstName(lastLead.name)} {getLastInitial(lastLead.name)}
              <span className="text-slate-500 font-normal"> • {formatDistanceToNow(new Date(lastLead.createdAt), { addSuffix: true })}</span>
            </div>
            {lastLead.property && (
              <div className="text-xs text-slate-600 mt-1">
                {lastLead.type === 'tour_request' ? '🗓️ Tour' : '💬 Message'} • {lastLead.property.title}
              </div>
            )}
          </div>
        )}
        <Link href="/dashboard/leads">
          <Button variant="outline" className="w-full">
            View Leads
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
