"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBunnyThumbnailOptions } from "@/lib/bunny-thumbnails";

interface VideoThumbnailSelectorProps {
  videoId: string;
  currentThumbnailUrl: string;
  mediaAssetId: string;
  onThumbnailChange: (newThumbnailUrl: string) => void;
}

export function VideoThumbnailSelector({
  videoId,
  currentThumbnailUrl,
  mediaAssetId,
  onThumbnailChange,
}: VideoThumbnailSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(currentThumbnailUrl);
  const [isSaving, setIsSaving] = useState(false);

  const thumbnailOptions = getBunnyThumbnailOptions(videoId);

  const handleSave = async () => {
    if (selectedUrl === currentThumbnailUrl) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/media/update-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaAssetId,
          thumbnailUrl: selectedUrl,
        }),
      });

      if (response.ok) {
        onThumbnailChange(selectedUrl);
        setIsOpen(false);
      } else {
        console.error('Failed to update thumbnail');
      }
    } catch (error) {
      console.error('Error updating thumbnail:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs"
      >
        Change Thumbnail
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Video Thumbnail</DialogTitle>
            <DialogDescription>
              Choose which frame to use as the video thumbnail
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
            {thumbnailOptions.map((option) => (
              <button
                key={option.url}
                onClick={() => setSelectedUrl(option.url)}
                className={`relative group rounded-lg overflow-hidden border-3 transition-all ${
                  selectedUrl === option.url
                    ? 'border-primary ring-4 ring-primary/20 shadow-lg'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
              >
                {/* Thumbnail Image - Portrait 9:16 ratio for vertical videos */}
                <div className="aspect-[9/16] bg-muted">
                  <img
                    src={option.url}
                    alt={`Thumbnail at ${option.timestamp}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Selected Indicator */}
                {selectedUrl === option.url && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-3">
                      <Check className="w-8 h-8" />
                    </div>
                  </div>
                )}

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-4 py-3">
                  <p className="text-sm text-white font-semibold">{option.label}</p>
                  <p className="text-sm text-white/80">{option.timestamp}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUrl(currentThumbnailUrl);
                setIsOpen(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || selectedUrl === currentThumbnailUrl}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Thumbnail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

