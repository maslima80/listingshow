"use client";

import { User, Mail, Phone, Share2, Instagram, Facebook, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormMock } from "./ContactFormMock";
import { ExternalLinks } from "./ExternalLinks";

interface Agent {
  id: string;
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  website?: string | null;
}

interface ExternalLink {
  label: string;
  url: string;
}

interface EndCreditsProps {
  agents: Agent[];
  propertyTitle: string;
  accentColor: string;
  externalLinks?: ExternalLink[];
  onShare: () => void;
}

export function EndCredits({ agents, propertyTitle, accentColor, externalLinks, onShare }: EndCreditsProps) {
  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="py-12 sm:py-16 bg-background" id="contact">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Agent Cards + Share */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Contact Agent</h2>
              <p className="text-muted-foreground">
                Contact us to schedule a showing or learn more
              </p>
            </div>

            {/* Agent Cards */}
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-card rounded-xl border border-border p-6 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Agent Photo */}
                  {agent.photoUrl ? (
                    <img
                      src={agent.photoUrl}
                      alt={agent.name}
                      className="w-24 h-24 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ring-2 ring-border">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                    {agent.title && (
                      <p className="text-sm text-muted-foreground mb-3">{agent.title}</p>
                    )}

                    {/* Bio */}
                    {agent.bio && (
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {agent.bio}
                      </p>
                    )}

                    {/* Social Links */}
                    {(agent.instagram || agent.facebook || agent.linkedin || agent.website) && (
                      <div className="flex gap-2 mb-4">
                        {agent.instagram && (
                          <a
                            href={agent.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Instagram className="w-4 h-4 text-white" />
                          </a>
                        )}
                        {agent.facebook && (
                          <a
                            href={agent.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Facebook className="w-4 h-4 text-white" />
                          </a>
                        )}
                        {agent.linkedin && (
                          <a
                            href={agent.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Linkedin className="w-4 h-4 text-white" />
                          </a>
                        )}
                        {agent.website && (
                          <a
                            href={agent.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Globe className="w-4 h-4 text-white" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Contact Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {agent.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmail(agent.email!)}
                          className="hover:text-white transition-colors"
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
                          Email
                        </Button>
                      )}
                      {agent.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCall(agent.phone!)}
                          className="hover:text-white transition-colors"
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
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Share Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto hover:text-white transition-colors"
              onClick={onShare}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentColor;
                e.currentTarget.style.borderColor = accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = '';
              }}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Property
            </Button>

            {/* External Links - Below Share Button */}
            {externalLinks && externalLinks.length > 0 && (
              <div className="mt-6">
                <ExternalLinks links={externalLinks} accentColor={accentColor} />
              </div>
            )}
          </div>

          {/* Right: Contact Form (Desktop Sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ContactFormMock propertyTitle={propertyTitle} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
