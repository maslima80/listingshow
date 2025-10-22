import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, agentProfiles, mediaAssets, propertyAgents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PropertyEditor } from "@/components/property-editor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.teamId) {
    redirect("/onboarding");
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Get property and verify ownership
  const [property] = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.id, id),
        eq(properties.teamId, session.user.teamId)
      )
    )
    .limit(1);

  if (!property) {
    notFound();
  }

  // Get property media
  const media = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.propertyId, id))
    .orderBy(mediaAssets.position);

  // Get assigned agents
  const assignedAgents = await db
    .select({
      agentId: propertyAgents.agentProfileId,
      isPrimary: propertyAgents.isPrimary,
    })
    .from(propertyAgents)
    .where(eq(propertyAgents.propertyId, id));

  // Get all team agent profiles
  const agents = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.teamId, session.user.teamId));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="border-l pl-4">
              <h1 className="font-bold text-xl">Edit Property</h1>
              <p className="text-sm text-muted-foreground">
                Update your property details
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <PropertyEditor 
            propertyId={property.id}
            teamId={session.user.teamId}
            userId={session.user.id}
            initialData={{
              name: property.title,
              listingPurpose: (property.listingPurpose || 'sale') as 'sale' | 'rent' | 'coming_soon',
              propertyType: property.propertyType || '',
              priceVisibility: (property.priceVisibility || 'show') as 'show' | 'upon_request' | 'contact',
              price: property.price || "",
              rentPeriod: property.rentPeriod || 'month',
              location: property.location,
              showFullAddress: true,
              beds: property.beds?.toString() || "",
              baths: property.baths?.toString() || "",
              parking: property.parking?.toString() || "",
              sqft: property.areaSqft || "",
              description: property.description || "",
              amenities: property.amenities || [],
              externalLinks: property.externalLinks as { label: string; url: string; }[] || [],
              agentIds: assignedAgents.map(a => a.agentId),
            }}
            existingMedia={media.map(m => ({
              id: m.id,
              url: m.url,
              thumbUrl: m.thumbUrl || undefined,
              type: m.type as "video" | "photo",
              isHero: m.id === property.coverAssetId,
              title: m.label || undefined,
              providerId: m.providerId || undefined,
            }))}
            agents={agents.map(a => ({
              id: a.id,
              name: a.name,
              title: a.title || "",
              photoUrl: a.photoUrl || "",
            }))}
          />
        </div>
      </main>
    </div>
  );
}
