import { redirect } from "next/navigation";
import {
  currentSession, isTestAccountEnabled, isUsingFallbackSecret, testAccount,
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
  const options = DEMO_TENANTS.map((t) => ({
    slug: t.slug,
    label: t.business,
    city: t.city,
    accent: t.accent,
  })).sort((a, b) => a.label.localeCompare(b.label, "fr"));

  return (
    <LoginForm
      options={options}
      initialSlug={demo && options.some((o) => o.slug === demo) ? demo : ""}
      expired={expire === "1"}
      devSecret={isUsingFallbackSecret()}
      testEmail={isTestAccountEnabled() ? testAccount().email : null}
    />
  );
}
