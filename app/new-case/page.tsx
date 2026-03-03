import { redirect } from "next/navigation";

export default function NewCaseRoute() {
  redirect("/?tab=new-case");
}
