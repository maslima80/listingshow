"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"

interface UseLeadCountOptions {
  status?: 'new' | 'contacted' | 'in_progress' | 'closed'
  interval?: number // milliseconds
  onCountIncrease?: (newCount: number, oldCount: number) => void
}

export function useLeadCount(options: UseLeadCountOptions = {}) {
  const { status, interval = 30000, onCountIncrease } = options
  const { data: session } = useSession()
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const previousCountRef = useRef<number>(0)

  useEffect(() => {
    if (!session?.user?.teamId) {
      setLoading(false)
      return
    }

    let timeoutId: NodeJS.Timeout

    const fetchCount = async () => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const params = new URLSearchParams()
        if (status) params.append('status', status)

        const response = await fetch(`/api/leads/count?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to fetch lead count')
        }

        const data = await response.json()
        const newCount = data.count || 0

        // Check if count increased
        if (newCount > previousCountRef.current && previousCountRef.current > 0) {
          onCountIncrease?.(newCount, previousCountRef.current)
        }

        previousCountRef.current = newCount
        setCount(newCount)
        setError(null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, ignore
          return
        }
        console.error('Failed to fetch lead count:', err)
        setError('Failed to fetch lead count')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchCount()

    // Set up polling with visibility check
    const startPolling = () => {
      timeoutId = setTimeout(() => {
        // Only fetch if document is visible
        if (document.visibilityState === 'visible') {
          fetchCount()
        }
        startPolling() // Schedule next poll
      }, interval)
    }

    startPolling()

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible, fetch immediately
        fetchCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      abortControllerRef.current?.abort()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session?.user?.teamId, status, interval, onCountIncrease])

  return { count, loading, error }
}
