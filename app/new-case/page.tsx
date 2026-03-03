import { redirect } from "next/navigation";

// Legacy standalone route kept for compatibility; workspace tab owns new-case UI.
export default function NewCaseRedirectPage() {
  redirect("/?tab=new-case");
}
