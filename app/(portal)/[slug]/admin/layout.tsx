import { notFound, redirect } from "next/navigation";
import { canAccess, currentSession } from "@/lib/portal/auth";
import { getTenant } from "@/lib/portal/registry";
import { loginHref, spaceHref } from "@/lib/portal/paths";

/* ════════════════════════════════════════════════════════════════════════════
   LA PORTE de tout ce qui vit sous `/<slug>/admin`.

   Les trois outils d'une vitrine sont nichés sous cette adresse — l'accueil,
   le suivi, les devis — et ce n'est pas qu'une affaire de rangement : la garde
   de session est posée ICI, une fois, dans le layout partagé. Une page ajoutée
   demain sous ce segment est protégée par construction, avant même d'avoir été
   écrite. C'est ce que le nid apporte de concret ; le chemin, seul, ne protège
   rien.

   ⚠️ Les pages gardent leur propre vérification. Ce n'est pas une redite
   inutile : leurs chargeurs ont de toute façon besoin de la session pour
   savoir QUELLE vitrine lire, et un contrôle d'accès qui ne tient qu'à un seul
   endroit tient mal. Ici, ils sont deux.

   Trois issues, dans cet ordre :
     • slug inconnu ⇒ 404 franc — répondre autre chose ferait de cette adresse
       un annuaire des démos existantes ;
     • pas de session ⇒ connexion, la vitrine déjà pré-sélectionnée ;
     • session d'une autre vitrine ⇒ retour chez soi.
   ════════════════════════════════════════════════════════════════════════════ */

export default async function TenantAdminLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getTenant(slug)) notFound();

  const session = await currentSession();
  if (!session) redirect(loginHref(slug));
  if (!canAccess(session, slug)) redirect(spaceHref(session.slug));

  return children;
}
