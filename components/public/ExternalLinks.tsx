"use client";

import { ExternalLink, Globe, Home } from "lucide-react";

interface ExternalLinkItem {
  label: string;
  url: string;
}

interface ExternalLinksProps {
  links: ExternalLinkItem[];
  accentColor: string;
}

// Platform icon mapping - using lucide icons
function getPlatformIcon(label: string) {
  const normalized = label.toLowerCase().trim();
  
  // For now, use Home icon for real estate platforms, Globe for others
  if (normalized.includes('zillow') || 
      normalized.includes('realtor') || 
      normalized.includes('redfin') || 
      normalized.includes('trulia') ||
      normalized.includes('mls')) {
    return Home;
  }
  
  return Globe;
}

export function ExternalLinks({ links, accentColor }: ExternalLinksProps) {
  if (!links || links.length === 0) return null;

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-muted-foreground">Also Listed On</h4>
      </div>

      {/* Horizontal Scrollable Gallery - Matching Social Icons Style */}
      <div className="relative -mx-4 sm:mx-0">
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-3 px-4 sm:px-0 pb-2">
            {links.map((link, index) => {
              const Icon = getPlatformIcon(link.label);
              
              return (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link.url)}
                  className="flex-none snap-center group"
                >
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    {/* Icon Circle - Matching Social Media Style */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Platform Name */}
                    <div className="text-xs font-medium text-center"
                      style={{ color: accentColor }}
                    >
                      {link.label}
                    </div>
                    
                    {/* External Link Indicator */}
                    <ExternalLink 
                      className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: accentColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator (Mobile) */}
        {links.length > 2 && (
          <div className="flex items-center justify-center gap-1 mt-2 sm:hidden">
            {links.map((_, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
