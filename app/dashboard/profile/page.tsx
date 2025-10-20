import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { agentProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileEditor } from "@/components/profile-editor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.teamId) {
    redirect("/onboarding");
  }

  // Get agent profile
  const [profile] = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.userId, session.user.id))
    .limit(1);

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
              <h1 className="font-bold text-xl">Your Profile</h1>
              <p className="text-sm text-muted-foreground">
                Create your professional identity that appears on every property
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <ProfileEditor
            profileId={profile?.id}
            initialData={{
              name: profile?.name || session.user.name || "",
              title: profile?.title || "",
              bio: profile?.bio || "",
              email: profile?.email || session.user.email || "",
              phone: profile?.phone || "",
              whatsapp: profile?.whatsapp || "",
              photoUrl: profile?.photoUrl || "",
              socialLinks: profile?.socialLinks as Record<string, string> || {},
            }}
          />
        </div>
      </main>
    </div>
  );
}
