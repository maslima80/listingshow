"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HostCardProps {
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  onScheduleTour: () => void;
  accentColor: string;
}

export function HostCard({ name, title, photoUrl, onScheduleTour, accentColor }: HostCardProps) {
  return (
    <div className="border-b border-border py-6 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          {/* Agent Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Headshot */}
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ring-2 ring-border">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            )}

            {/* Name & Title */}
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Presented by</div>
              <div className="font-semibold text-sm sm:text-base truncate">{name}</div>
              {title && (
                <div className="text-xs text-muted-foreground truncate">{title}</div>
              )}
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleTour}
            className="flex-shrink-0 hover:text-white transition-colors"
            style={{
              borderColor: accentColor,
              color: accentColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accentColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            Schedule Tour
          </Button>
        </div>
      </div>
    </div>
  );
}
