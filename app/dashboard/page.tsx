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
import { PlusCircle, Users, Palette, CreditCard, LayoutGrid, UserCircle, ExternalLink, Eye, MapPin, Star, Download } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { DashboardClientWrapper } from "@/components/dashboard-client";
import { LeadsCard } from "@/components/leads-card";

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
    <DashboardClientWrapper 
      userName={session.user.name || undefined}
      teamSlug={session.user.teamSlug || undefined}
    >
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
            <p className="text-slate-600">Manage your properties and showcase</p>
          </div>

          {/* Quick Actions - Priority Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Leads */}
            <LeadsCard />

            {/* Your Hub */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                  <LayoutGrid className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Your Hub</CardTitle>
                <CardDescription>
                  Build your link-in-bio page with premium blocks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/hub">
                  <Button className="w-full">
                    Build Hub
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* View Properties */}
            <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>View Properties</CardTitle>
                <CardDescription>
                  See all your listings and manage them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Properties</span>
                    <span className="font-semibold">{teamProperties.length}</span>
                  </div>
                  <Link href="/dashboard/properties">
                    <Button variant="outline" className="w-full">
                      Manage Properties
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Managers Section */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">Content Managers</h3>
            <p className="text-muted-foreground mb-6">Build content for your Hub and property pages</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Neighborhoods */}
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">Neighborhoods</CardTitle>
                  <CardDescription>
                    Showcase areas you serve
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/neighborhoods">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Testimonials</CardTitle>
                  <CardDescription>
                    Collect client reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/testimonials">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                    <Download className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Resources</CardTitle>
                  <CardDescription>
                    Lead magnets & guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/resources">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </DashboardClientWrapper>
  );
}
