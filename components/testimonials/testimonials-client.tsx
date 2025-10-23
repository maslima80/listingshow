'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TestimonialsList } from './testimonials-list'
import { RequestTestimonialDialog } from './request-testimonial-dialog'
import { AddTestimonialDialog } from './add-testimonial-dialog'
import { useToast } from '@/hooks/use-toast'

interface Testimonial {
  id: string
  clientName: string
  clientLocation: string | null
  clientPhotoUrl: string | null
  testimonialText: string
  rating: number | null
  videoUrl: string | null
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string | null
  approvedAt: string | null
  createdAt: string
}

export function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('approved')
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchTestimonials = async (status?: string) => {
    try {
      const url = status ? `/api/testimonials?status=${status}` : '/api/testimonials'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch testimonials')
      const data = await response.json()
      setTestimonials(data)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'request') {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchTestimonials(activeTab)
  }, [activeTab])

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/approve`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to approve testimonial')

      toast({
        title: 'Success',
        description: 'Testimonial approved',
      })

      fetchTestimonials(activeTab)
    } catch (error) {
      console.error('Error approving testimonial:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve testimonial',
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/reject`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to reject testimonial')

      toast({
        title: 'Success',
        description: 'Testimonial rejected',
      })

      fetchTestimonials(activeTab)
    } catch (error) {
      console.error('Error rejecting testimonial:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject testimonial',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete testimonial')

      toast({
        title: 'Success',
        description: 'Testimonial deleted',
      })

      fetchTestimonials(activeTab)
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
      })
    }
  }

  const handleSave = () => {
    setAddDialogOpen(false)
    fetchTestimonials(activeTab)
  }

  const approvedCount = testimonials.filter(t => t.status === 'approved').length
  const pendingCount = testimonials.filter(t => t.status === 'pending').length

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile-friendly header */}
        <div className="space-y-4 mb-6">
          {/* Tabs */}
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="approved" className="text-xs sm:text-sm">
              Approved {approvedCount > 0 && `(${approvedCount})`}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="request" className="text-xs sm:text-sm">
              Request
            </TabsTrigger>
          </TabsList>

          {/* Action Buttons - Always visible on mobile */}
          {activeTab !== 'request' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setAddDialogOpen(true)}
                className="flex-1 sm:flex-none"
                size="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manually
              </Button>
              <Button 
                onClick={() => setActiveTab('request')}
                variant="outline"
                className="flex-1 sm:flex-none"
                size="default"
              >
                Request New
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="approved">
          <TestimonialsList
            testimonials={testimonials}
            loading={loading}
            onDelete={handleDelete}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="pending">
          <TestimonialsList
            testimonials={testimonials}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            showActions={true}
            isPending={true}
          />
        </TabsContent>

        <TabsContent value="request">
          <RequestTestimonialDialog embedded />
        </TabsContent>
      </Tabs>

      {/* Add Testimonial Dialog */}
      <AddTestimonialDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSave}
      />
    </>
  )
}
