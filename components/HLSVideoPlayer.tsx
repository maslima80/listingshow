"use client";

import { useEffect, useRef } from "react";

interface HLSVideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  controlsList?: string;
  onLoadedMetadata?: () => void;
}

export function HLSVideoPlayer({
  src,
  className,
  controls = true,
  autoPlay = false,
  playsInline = true,
  controlsList,
  onLoadedMetadata,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if the source is an HLS stream
    const isHLS = src.includes('.m3u8');

    if (isHLS) {
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
                console.log('Video not ready yet (still encoding on Bunny.net)');
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
                  console.log('Cannot recover from error, destroying HLS instance');
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
