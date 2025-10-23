'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Download, User, Mail, Phone, Calendar } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Download {
  id: string
  leadName: string
  leadEmail: string
  leadPhone: string | null
  downloadedAt: string
  ipAddress: string
}

interface ResourceWithDownloads {
  id: string
  title: string
  description: string | null
  downloadCount: number
  downloads: Download[]
}

interface ResourceDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceId: string
}

export function ResourceDetailsDialog({ open, onOpenChange, resourceId }: ResourceDetailsDialogProps) {
  const [resource, setResource] = useState<ResourceWithDownloads | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open && resourceId) {
      fetchResourceDetails()
    }
  }, [open, resourceId])

  const fetchResourceDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/resources/${resourceId}`)
      if (!response.ok) throw new Error('Failed to fetch resource details')
      const data = await response.json()
      setResource(data)
    } catch (error) {
      console.error('Error fetching resource details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load resource details',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Resource Details & Leads</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : resource ? (
          <div className="space-y-6">
            {/* Resource Info */}
            <div>
              <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
              {resource.description && (
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resource.downloadCount}</p>
                    <p className="text-xs text-muted-foreground">Total Downloads</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resource.downloads.length}</p>
                    <p className="text-xs text-muted-foreground">Unique Leads</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Download History */}
            <div>
              <h4 className="font-semibold mb-3">Download History</h4>
              
              {resource.downloads.length === 0 ? (
                <Card className="p-8 text-center">
                  <Download className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No downloads yet</p>
                </Card>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {resource.downloads.map((download) => (
                      <Card key={download.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            {/* Name */}
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{download.leadName}</span>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={`mailto:${download.leadEmail}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {download.leadEmail}
                              </a>
                            </div>

                            {/* Phone */}
                            {download.leadPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a
                                  href={`tel:${download.leadPhone}`}
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {download.leadPhone}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Date */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(download.downloadedAt)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Export Tip */}
            {resource.downloads.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  💡 <strong>Pro Tip:</strong> These leads are hot! They've shown interest by downloading your content. 
                  Follow up within 24 hours for best results.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load resource details
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
