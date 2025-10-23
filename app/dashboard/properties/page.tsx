import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, mediaAssets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { DashboardClientWrapper } from "@/components/dashboard-client";

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.teamId) {
    redirect("/onboarding");
  }

  // Fetch team properties with cover media
  const teamProperties = await db
    .select({
      property: properties,
      coverMedia: mediaAssets,
    })
    .from(properties)
    .leftJoin(mediaAssets, eq(properties.coverAssetId, mediaAssets.id))
    .where(eq(properties.teamId, session.user.teamId))
    .orderBy(desc(properties.createdAt));

  return (
    <DashboardClientWrapper 
      userName={session.user.name || undefined}
      teamSlug={session.user.teamSlug || undefined}
    >
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Properties</h1>
                <p className="text-muted-foreground">
                  Manage your property listings
                </p>
              </div>
              <Link href="/dashboard/properties/new">
                <Button size="lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Property
                </Button>
              </Link>
            </div>
          </div>

          {/* Properties Grid */}
          {teamProperties.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Badge variant="secondary" className="text-sm">
                  {teamProperties.length} {teamProperties.length === 1 ? 'property' : 'properties'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamProperties.map(({ property, coverMedia }) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    coverMedia={coverMedia}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🏡</div>
                <h3 className="text-2xl font-bold mb-2">No properties yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first cinematic property page and start showcasing
                </p>
                <Link href="/dashboard/properties/new">
                  <Button size="lg">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Your First Property
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardClientWrapper>
  );
}
