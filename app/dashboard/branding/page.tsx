import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamThemes, themes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ThemePicker } from "@/components/theme-picker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BrandingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.teamId) {
    redirect("/onboarding");
  }

  // Get current theme
  const teamTheme = await db
    .select({
      accentColor: teamThemes.accentColor,
      mode: themes.mode,
    })
    .from(teamThemes)
    .innerJoin(themes, eq(teamThemes.themeId, themes.id))
    .where(eq(teamThemes.teamId, session.user.teamId))
    .limit(1);

  const currentMode = teamTheme[0]?.mode || "light";
  const currentAccent = teamTheme[0]?.accentColor || "#C9A66B";

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
              <h1 className="font-bold text-xl">Branding & Theme</h1>
              <p className="text-sm text-muted-foreground">
                Customize how your public pages look (properties & hub)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <ThemePicker
            teamId={session.user.teamId}
            currentMode={currentMode}
            currentAccent={currentAccent}
          />
        </div>
      </main>
    </div>
  );
}
