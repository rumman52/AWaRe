import { redirect } from "next/navigation";

// Legacy standalone route kept for compatibility; workspace tab owns chat UI.
export default function ChatRedirectPage() {
  redirect("/?tab=chat");
}
