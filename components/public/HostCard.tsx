"use client";

import { useState } from "react";
import { User, Mail, Phone, ChevronDown, ChevronUp, Instagram, Facebook, Linkedin, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HostCardProps {
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  website?: string | null;
  onScheduleTour: () => void;
  accentColor: string;
}

export function HostCard({ name, title, photoUrl, bio, email, phone, whatsapp, instagram, facebook, linkedin, website, onScheduleTour, accentColor }: HostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEmail = () => {
    if (email) window.location.href = `mailto:${email}`;
  };

  const handleCall = () => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    if (whatsapp) {
      const cleanNumber = whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const hasSocialLinks = instagram || facebook || linkedin || website;
  const hasContactInfo = email || phone || whatsapp;

  return (
    <div className="border-b border-border py-6 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Compact View */}
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

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onScheduleTour}
              className="hover:text-white transition-colors"
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
            
            {/* Expand/Collapse Button - Only show if there's content to expand */}
            {(bio || hasSocialLinks || hasContactInfo) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" style={{ color: accentColor }} />
                ) : (
                  <ChevronDown className="w-5 h-5" style={{ color: accentColor }} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Details - Only show if there's content to display */}
        {isExpanded && (bio || hasSocialLinks || hasContactInfo) && (
          <div className="mt-6 pt-6 border-t border-border animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Bio & Social - Only show if bio or social links exist */}
              {(bio || hasSocialLinks) && (
                <div className="space-y-4">
                  {bio && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">About</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                    </div>
                  )}

                  {hasSocialLinks && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Connect</h4>
                      <div className="flex gap-2">
                      {instagram && (
                        <a
                          href={instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          style={{ backgroundColor: accentColor }}
                          aria-label="Instagram"
                        >
                          <Instagram className="w-4 h-4 text-white" />
                        </a>
                      )}
                      {facebook && (
                        <a
                          href={facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          style={{ backgroundColor: accentColor }}
                          aria-label="Facebook"
                        >
                          <Facebook className="w-4 h-4 text-white" />
                        </a>
                      )}
                      {linkedin && (
                        <a
                          href={linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          style={{ backgroundColor: accentColor }}
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4 text-white" />
                        </a>
                      )}
                      {website && (
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          style={{ backgroundColor: accentColor }}
                          aria-label="Website"
                        >
                          <Globe className="w-4 h-4 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Right: Contact Options - Only show if any contact info exists */}
              {hasContactInfo && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Contact Options</h4>
                  <div className="space-y-2">
                    {email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEmail}
                        className="w-full justify-start hover:text-white transition-colors"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = accentColor;
                          e.currentTarget.style.borderColor = accentColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {email}
                      </Button>
                    )}
                    {phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCall}
                        className="w-full justify-start hover:text-white transition-colors"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = accentColor;
                          e.currentTarget.style.borderColor = accentColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {phone}
                      </Button>
                    )}
                    {whatsapp && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWhatsApp}
                        className="w-full justify-start hover:text-white transition-colors"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#25D366';
                          e.currentTarget.style.borderColor = '#25D366';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
