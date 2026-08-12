import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { DashboardClient } from "@/components/admin/DashboardClient";

export default async function AdminDashboardPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/admin/login");
  }

  return <DashboardClient adminEmail={session.email} />;
}
