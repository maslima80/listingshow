"use client";

import { Badge } from "@/components/ui/badge";

interface SynopsisProps {
  description?: string | null;
  highlights?: string[] | null;
  accentColor: string;
}

export function Synopsis({ description, highlights, accentColor }: SynopsisProps) {
  if (!description && (!highlights || highlights.length === 0)) {
    return null;
  }

  return (
    <div className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          {/* About Section */}
          {description && (
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">About This Property</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {highlights.map((highlight, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm sm:text-base py-2 px-4 rounded-full"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                      borderColor: `${accentColor}30`,
                    }}
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
