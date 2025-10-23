'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Video, TrendingUp, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VideoQuota {
  used: number
  limit: number
  remaining: number
  percentage: number
  status: {
    message: string
    variant: 'default' | 'warning' | 'destructive'
  }
}

export function VideoQuotaWidget() {
  const [quota, setQuota] = useState<VideoQuota | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQuota = async () => {
    try {
      const response = await fetch('/api/video-quota')
      if (!response.ok) throw new Error('Failed to fetch quota')
      const data = await response.json()
      setQuota(data)
    } catch (error) {
      console.error('Error fetching quota:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuota()
  }, [])

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    )
  }

  if (!quota) return null

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Video Quota</h3>
          </div>
          {quota.percentage >= 75 && (
            <AlertCircle className={`w-5 h-5 ${
              quota.percentage >= 90 ? 'text-red-600' : 'text-yellow-600'
            }`} />
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatMinutes(quota.used)} used
            </span>
            <span className="font-medium">
              {formatMinutes(quota.limit)} total
            </span>
          </div>
          <Progress 
            value={quota.percentage} 
            className={
              quota.percentage >= 90 
                ? '[&>div]:bg-red-600' 
                : quota.percentage >= 75 
                ? '[&>div]:bg-yellow-600' 
                : '[&>div]:bg-purple-600'
            }
          />
        </div>

        {/* Status Message */}
        {quota.percentage >= 75 && (
          <Alert variant={quota.status.variant === 'destructive' ? 'destructive' : 'default'}>
            <AlertDescription className="text-sm">
              {quota.status.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-green-600">
              {formatMinutes(quota.remaining)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Usage</p>
            <p className="text-lg font-bold">
              {quota.percentage}%
            </p>
          </div>
        </div>

        {/* Upgrade CTA */}
        {quota.percentage >= 90 && (
          <Button className="w-full" variant="default">
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>
    </Card>
  )
}
