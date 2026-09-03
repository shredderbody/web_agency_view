import { redirect } from "next/navigation";
import {
  currentSession, isTestAccountEnabled, isUsingFallbackSecret, testEmailFor,
} from "@/lib/portal/auth";
import { DEMO_TENANTS } from "@/lib/portal/registry";
import LoginForm from "@/components/portal/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; expire?: string }>;
}) {
  const session = await currentSession();
  if (session) redirect(`/espace/${session.slug}`);

  const { demo, expire } = await searchParams;
  // Chaque démo porte son e-mail de connexion : choisir sa vitrine dans le
  // premier onglet pré-remplit l'identifiant du second.
  const withTest = isTestAccountEnabled();
  const options = DEMO_TENANTS.map((t) => ({
    slug: t.slug,
    label: t.business,
    city: t.city,
    accent: t.accent,
    testEmail: withTest ? testEmailFor(t.slug) : null,
  })).sort((a, b) => a.label.localeCompare(b.label, "fr"));

  return (
    <LoginForm
      options={options}
      initialSlug={demo && options.some((o) => o.slug === demo) ? demo : ""}
      expired={expire === "1"}
      devSecret={isUsingFallbackSecret()}
      testAccounts={withTest}
    />
  );
}
