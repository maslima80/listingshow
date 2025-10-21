"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExternalLinkItem {
  label: string;
  url: string;
}

interface ExternalLinksProps {
  links: ExternalLinkItem[];
  accentColor: string;
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

      {/* Horizontal Scrollable Gallery */}
      <div className="relative -mx-4 sm:mx-0">
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-2 px-4 sm:px-0 pb-2">
            {links.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick(link.url)}
                className="flex-none snap-center whitespace-nowrap hover:scale-105 transition-transform"
                style={{
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                {link.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Scroll Indicator (Mobile) */}
        {links.length > 2 && (
          <div className="flex items-center justify-center gap-1 mt-1 sm:hidden">
            {links.map((_, index) => (
              <div
                key={index}
                className="w-1 h-1 rounded-full bg-muted-foreground/30"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
