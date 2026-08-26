import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { WorkDashboardClient } from "@/components/admin/WorkDashboardClient";

export default async function AdminWorkPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/admin/login");
  }

  return <WorkDashboardClient adminEmail={session.email} />;
}
