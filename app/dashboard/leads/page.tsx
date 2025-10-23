import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LeadsClient } from "@/components/leads-client";
import { DashboardClientWrapper } from "@/components/dashboard-client";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.teamId) {
    redirect("/onboarding");
  }

  return (
    <DashboardClientWrapper
      userName={session.user.name || undefined}
      teamSlug={session.user.teamSlug || undefined}
    >
      <LeadsClient />
    </DashboardClientWrapper>
  );
}
