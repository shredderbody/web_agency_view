import { redirect } from "next/navigation";
import { currentSession } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";

/** `/espace` n'est pas une page : c'est un aiguillage vers l'espace de la session. */
export default async function EspaceIndex() {
  const session = await currentSession();
  redirect(session ? `/espace/${session.slug}` : "/espace/login");
}
