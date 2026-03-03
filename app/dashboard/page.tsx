import { redirect } from "next/navigation";

// Legacy standalone route kept for compatibility; workspace tab owns dashboard UI.
export default function DashboardRedirectPage() {
  redirect("/?tab=dashboard");
}
