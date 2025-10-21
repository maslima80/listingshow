"use client";

import { useEffect, useRef, useState } from "react";

interface HLSVideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  controlsList?: string;
  onLoadedMetadata?: () => void;
  onError?: (error: string) => void;
}

export function HLSVideoPlayer({
  src,
  className,
  controls = true,
  autoPlay = false,
  playsInline = true,
  controlsList,
  onLoadedMetadata,
  onError,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('HLSVideoPlayer: Loading video from:', src);

    // Check if this is a Bunny.net iframe embed URL
    const isBunnyEmbed = src.includes('iframe.mediadelivery.net/embed');
    
    // Check if the source is an HLS stream
    const isHLS = src.includes('.m3u8');

    if (isBunnyEmbed) {
      // For Bunny.net iframe embeds, we need to use an iframe instead of video tag
      // This will be handled by the parent component
      console.log('Bunny.net iframe embed detected');
      return;
    } else if (isHLS) {
      // For HLS streams, we need hls.js (except on Safari which supports HLS natively)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
      } else if (typeof window !== 'undefined' && 'Hls' in window) {
        // Use hls.js for other browsers
        const Hls = (window as any).Hls;
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          
          hls.loadSource(src);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) {
              video.play().catch(err => console.log('Autoplay prevented:', err));
            }
          });

          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              // Check if it's a 404 (video still encoding)
              if (data.response?.code === 404 || data.details === 'manifestLoadError') {
                const errorMsg = 'Video is still processing. Please wait 1-5 minutes and refresh the page.';
                console.log(errorMsg);
                setError(errorMsg);
                if (onError) onError(errorMsg);
                hls.destroy();
                return;
              }
              
              console.error('HLS fatal error:', data);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  const generalError = 'Unable to play video. Please try again later.';
                  setError(generalError);
                  if (onError) onError(generalError);
                  hls.destroy();
                  break;
              }
            }
          });

          return () => {
            hls.destroy();
          };
        }
      } else {
        // Load hls.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = () => {
          const Hls = (window as any).Hls;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            if (autoPlay) {
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(err => console.log('Autoplay prevented:', err));
              });
            }
          }
        };
        document.head.appendChild(script);
        
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    } else {
      // Regular video file
      video.src = src;
      if (autoPlay) {
        video.play().catch(err => console.log('Autoplay prevented:', err));
      }
    }
  }, [src, autoPlay]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/90 text-white p-8`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">⏳</div>
          <div className="text-lg font-semibold">Video Processing</div>
          <div className="text-sm text-white/70 max-w-md">{error}</div>
        </div>
      </div>
    );
  }

  // Check if this is a Bunny.net iframe embed
  const isBunnyEmbed = src.includes('iframe.mediadelivery.net/embed');

  if (isBunnyEmbed) {
    return (
      <iframe
        src={src}
        className={className}
        loading="lazy"
        style={{ border: 'none', width: '100%', height: '100%' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      playsInline={playsInline}
      controlsList={controlsList}
      onLoadedMetadata={onLoadedMetadata}
    />
  );
}
