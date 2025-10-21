import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, mediaAssets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, Users, Palette, CreditCard, LayoutGrid, UserCircle, ExternalLink, Eye } from "lucide-react";
import { PropertyCard } from "@/components/property-card";

export default async function DashboardPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/listin.show new logo.png" 
                alt="Listing.Show" 
                className="h-8 w-auto"
              />
              {session.user.teamSlug && (
                <div className="text-xs text-muted-foreground border-l pl-3 ml-1">
                  listing.show/u/{session.user.teamSlug}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Welcome, {session.user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
            <p className="text-slate-600">Manage your properties and showcase</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Complete Profile - Priority */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Add your photo, bio, and contact info to appear on properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/profile">
                  <Button className="w-full">
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Create Property */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <PlusCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Create Property</CardTitle>
                <CardDescription>
                  Launch the cinematic builder and create stunning property pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/properties/new">
                  <Button className="w-full">
                    Create Property
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Your Hub */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                  <LayoutGrid className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Your Hub</CardTitle>
                <CardDescription>
                  Edit your link-in-bio page with drag & drop blocks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Agents */}
            {session.user.teamMode === "multi" && (
              <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-emerald-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle>Agents</CardTitle>
                  <CardDescription>
                    Manage your team members and agent profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Branding & Theme */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-amber-200">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                  <Palette className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle>Branding & Theme</CardTitle>
                <CardDescription>
                  Customize your colors and visual style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/branding">
                  <Button variant="outline" className="w-full">
                    Customize Theme
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Billing & Usage */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-slate-200">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
                  <CreditCard className="w-6 h-6 text-slate-600" />
                </div>
                <CardTitle>Billing & Usage</CardTitle>
                <CardDescription>
                  Manage your subscription and track usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Trial Status</span>
                    <span className="font-medium text-emerald-600">14 days remaining</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Properties</span>
                    <span className="font-medium">0 / 2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Video Minutes</span>
                    <span className="font-medium">0 / 30</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Manage Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Properties Section */}
          {teamProperties.length > 0 ? (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Your Properties</h3>
                <Badge variant="secondary">{teamProperties.length} {teamProperties.length === 1 ? 'property' : 'properties'}</Badge>
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
            <div className="mt-12 text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
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
    </div>
  );
}
