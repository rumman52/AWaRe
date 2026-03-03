import { redirect } from "next/navigation";

export default function ChatRedirectPage() {
  redirect("/?tab=chat");
}
