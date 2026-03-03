import { redirect } from "next/navigation";

export default function NewCaseRedirectPage() {
  redirect("/?tab=new-case");
}
