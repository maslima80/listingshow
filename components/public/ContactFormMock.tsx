"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface ContactFormMockProps {
  propertyTitle: string;
  accentColor: string;
}

export function ContactFormMock({ propertyTitle, accentColor }: ContactFormMockProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-2">Ask about {propertyTitle}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Get more information or schedule a showing
      </p>

      {showConfirmation ? (
        <div className="py-12 text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Check className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <h4 className="text-lg font-semibold mb-2">Message Sent ✓</h4>
          <p className="text-sm text-muted-foreground">
            (Form wiring coming soon)
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              className="mt-1"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="mt-1"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="I'm interested in this property..."
              rows={4}
              className="mt-1 resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full text-white font-semibold"
            style={{ backgroundColor: accentColor }}
          >
            Send Message
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This is a visual mockup. Backend integration coming soon.
          </p>
        </form>
      )}
    </div>
  );
}
