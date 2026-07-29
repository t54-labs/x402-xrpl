import { redirect } from "next/navigation";

// The x402 endpoint registration flow now lives at /join/service, the single
// "Get listed" entry point. Keep this route as a redirect so old links/bookmarks
// and any in-flight references still resolve.
export default function RegisterRedirect() {
  redirect("/join/service");
}
