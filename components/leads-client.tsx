"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  MessageSquareIcon,
  ExternalLinkIcon,
  Loader2Icon,
  InboxIcon,
} from "lucide-react"

interface Lead {
  id: string
  teamId: string
  propertyId: string | null
  type: 'tour_request' | 'message'
  name: string
  email: string
  phone: string | null
  preferredDate: string | null
  preferredTimeWindow: 'morning' | 'afternoon' | 'evening' | null
  message: string | null
  status: 'new' | 'contacted' | 'in_progress' | 'closed'
  source: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  property: {
    id: string
    title: string
    slug: string
  } | null
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  closed: 'Closed',
}

const timeWindowLabels = {
  morning: 'Morning (8am - 12pm)',
  afternoon: 'Afternoon (12pm - 5pm)',
  evening: 'Evening (5pm - 8pm)',
}

export function LeadsClient() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [notes, setNotes] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams?.get('status') || 'all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const response = await fetch(`/api/leads/list?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch leads",
        })
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      toast({
        title: "Error",
        description: "Failed to fetch leads",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [statusFilter, typeFilter])

  const openDetails = (lead: Lead) => {
    setSelectedLead(lead)
    setNotes(lead.notes || "")
    setDetailsOpen(true)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Status updated",
          description: `Lead marked as ${statusLabels[newStatus as keyof typeof statusLabels]}`,
        })
        fetchLeads()
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus as any })
        }
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const saveNotes = async () => {
    if (!selectedLead) return

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        toast({
          title: "Notes saved",
          description: "Your notes have been saved",
        })
        fetchLeads()
      } else {
        throw new Error('Failed to save notes')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
      })
    }
  }

  const newLeadsCount = leads.filter(l => l.status === 'new').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Leads</h1>
            <p className="text-sm text-slate-600">Manage tour requests and messages</p>
          </div>

          {/* Compact Stats Bar (Mobile) - Hidden on Desktop */}
          <div className="md:hidden mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">{leads.length}</span>
              <span className="text-slate-500">Total</span>
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-blue-600">{newLeadsCount}</span>
              <span className="text-slate-500">New</span>
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-green-600">{leads.filter(l => l.type === 'tour_request').length}</span>
              <span className="text-slate-500">Tours</span>
            </div>
          </div>

          {/* Stats Cards (Desktop Only) */}
          <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{newLeadsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tour Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leads.filter(l => l.type === 'tour_request').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leads.filter(l => l.type === 'message').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segmented Filters (Mobile-First) */}
          <div className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'all' && typeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setStatusFilter('new'); setTypeFilter('all'); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                New {newLeadsCount > 0 && `(${newLeadsCount})`}
              </button>
              <button
                onClick={() => { setStatusFilter('all'); setTypeFilter('tour_request'); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  typeFilter === 'tour_request'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🗓️ Tours
              </button>
              <button
                onClick={() => { setStatusFilter('all'); setTypeFilter('message'); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  typeFilter === 'message'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                💬 Messages
              </button>
            </div>
          </div>

          {/* Leads List */}
          {leads.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <InboxIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-slate-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">No leads yet</h3>
              <p className="text-sm sm:text-base text-slate-600">
                Leads from your property pages will appear here
              </p>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {leads.map((lead) => (
                <Card
                  key={lead.id}
                  className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => openDetails(lead)}
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Mobile-Optimized Layout */}
                    <div className="space-y-3">
                      {/* Header Row: Name + Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{lead.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={`${statusColors[lead.status]} text-xs px-2 py-0.5`}
                          >
                            {statusLabels[lead.status]}
                          </Badge>
                          <span className="text-lg">
                            {lead.type === 'tour_request' ? '🗓️' : '💬'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info - Stacked on Mobile */}
                      <div className="space-y-1.5 text-sm">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MailIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PhoneIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                            <span>{lead.phone}</span>
                          </a>
                        )}
                        <div className="flex items-center gap-2 text-slate-500">
                          <ClockIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      {/* Property Link */}
                      {lead.property && (
                        <Link
                          href={`/p/${lead.property.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate">{lead.property.title}</span>
                          <ExternalLinkIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        </Link>
                      )}

                      {/* Message Preview */}
                      {lead.message && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {lead.message}
                        </p>
                      )}

                      {/* Status Selector - Full Width on Mobile */}
                      <div className="pt-2 border-t border-slate-100">
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          disabled={updatingStatus}
                        >
                          <SelectTrigger
                            className="w-full sm:w-[160px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lead Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              {selectedLead?.type === 'tour_request' ? 'Tour Request' : 'Message'} from {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 mt-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-medium text-blue-600 hover:underline block"
                  >
                    {selectedLead.email}
                  </a>
                </div>
                {selectedLead.phone && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="font-medium text-blue-600 hover:underline block"
                    >
                      {selectedLead.phone}
                    </a>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{statusLabels[selectedLead.status]}</p>
                </div>
              </div>

              {/* Tour Details */}
              {selectedLead.type === 'tour_request' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {selectedLead.preferredDate && (
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Preferred Date
                      </Label>
                      <p className="font-medium">
                        {new Date(selectedLead.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedLead.preferredTimeWindow && (
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        Preferred Time
                      </Label>
                      <p className="font-medium">
                        {timeWindowLabels[selectedLead.preferredTimeWindow]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">Message</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              )}

              {/* Property */}
              {selectedLead.property && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">Property</Label>
                  <Link
                    href={`/p/${selectedLead.property.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {selectedLead.property.title}
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Notes */}
              <div className="pt-4 border-t">
                <Label htmlFor="notes" className="text-sm text-muted-foreground">
                  Internal Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={4}
                  className="mt-1"
                />
                <Button
                  onClick={saveNotes}
                  className="mt-2"
                  size="sm"
                >
                  Save Notes
                </Button>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Received {formatDistanceToNow(new Date(selectedLead.createdAt), { addSuffix: true })}</p>
                {selectedLead.source && <p>Source: {selectedLead.source}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
