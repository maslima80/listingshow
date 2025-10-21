import { useEffect, useState } from 'react';

/**
 * Hook to fetch and update video duration after encoding
 * Polls Bunny API until duration is available
 */
export function useVideoDuration(videoId: string | null, mediaAssetId: string | null) {
  const [duration, setDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!videoId || !mediaAssetId) return;

    let attempts = 0;
    const maxAttempts = 10; // Try for ~5 minutes (30s intervals)
    
    const fetchDuration = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/videos/update-duration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, mediaAssetId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.durationSec > 0) {
            setDuration(data.durationSec);
            setIsLoading(false);
            return true; // Stop polling
          }
        }
        return false; // Continue polling
      } catch (error) {
        console.error('Failed to fetch duration:', error);
        return false;
      }
    };

    // Initial fetch after 5 seconds
    const initialTimeout = setTimeout(async () => {
      const success = await fetchDuration();
      
      if (!success && attempts < maxAttempts) {
        // Poll every 30 seconds
        const interval = setInterval(async () => {
          attempts++;
          const success = await fetchDuration();
          
          if (success || attempts >= maxAttempts) {
            clearInterval(interval);
            setIsLoading(false);
          }
        }, 30000);

        return () => clearInterval(interval);
      }
    }, 5000);

    return () => clearTimeout(initialTimeout);
  }, [videoId, mediaAssetId]);

  return { duration, isLoading };
}
