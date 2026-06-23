import { redirect } from "next/navigation";

// The Partners page is superseded by the DB-backed Directory.
export default function PartnersPage() {
  redirect("/directory");
}
