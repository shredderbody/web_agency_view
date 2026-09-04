"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle, BookOpen, FileText, LayoutDashboard, Receipt, Settings2, Users,
} from "lucide-react";
import type { QuotesPageData } from "@/lib/portal/quotesPage";
import type { PortalDocument } from "@/lib/portal/documents.shared";
import type { PortalCustomer } from "@/lib/portal/types";
import type { StoredCatalogItem, StoredCategory } from "@/lib/portal/catalogStore";
import type { DocSettings } from "@/lib/portal/docSettings";
import { docStrings } from "@/lib/portal/documentsStrings";
import { spaceHref } from "@/lib/portal/paths";
import PortalBar from "../PortalBar";
import { QuotesProvider, type QuotesCtx, type TabId } from "./context";
import EditorTab from "./EditorTab";
import ListTab from "./ListTab";
import ClientsTab from "./ClientsTab";
import CatalogTab from "./CatalogTab";
import DashboardTab from "./DashboardTab";
import SettingsTab from "./SettingsTab";

/* ════════════════════════════════════════════════════════════════════════════
   L'OUTIL DE DEVIS D'UNE VITRINE — sept onglets, une seule page.

   Portage de `~/devis_app` (2026-09-04). La version précédente n'avait qu'un
   écran : une liste et un éditeur. Il y manquait ce qui fait qu'un devis se
   compose vite — un catalogue qu'on modifie, un fichier client qu'on tient, des
   réglages d'émetteur, un tableau de bord, et la DICTÉE.

   ── Pourquoi une seule page et non sept routes ──────────────────────────────
   Les données des sept onglets arrivent en UN aller-retour serveur
   (`loadQuotesPage`). Changer d'onglet n'attend donc aucun réseau — et c'est
   exactement ce qu'on veut d'un outil qu'on utilise le téléphone à l'oreille :
   passer du devis au catalogue puis au client sans jamais attendre.

   ── Les onglets sur téléphone ───────────────────────────────────────────────
   Ils passent en BARRE BASSE fixe, comme dans `devis_app` : sept onglets en
   défilement horizontal en haut d'écran, c'est six onglets qu'on ne voit pas.
   ════════════════════════════════════════════════════════════════════════════ */

const TABS: { id: TabId; icon: typeof FileText }[] = [
  { id: "editor", icon: FileText },
  { id: "quotes", icon: FileText },
  { id: "invoices", icon: Receipt },
  { id: "clients", icon: Users },
  { id: "catalog", icon: BookOpen },
  { id: "dashboard", icon: LayoutDashboard },
  { id: "settings", icon: Settings2 },
];

/** Les quatre onglets qu'on atteint au pouce. Les trois autres restent en haut. */
const PHONE_TABS: TabId[] = ["editor", "quotes", "invoices", "clients"];

export default function QuotesApp({ data }: { data: QuotesPageData }) {
  const { tenant, lang, isAdmin } = data;
  const t = docStrings(lang);

  /* On arrive TOUJOURS sur l'éditeur, le document le plus récent ouvert —
     comme dans `devis_app`, où « Devis » est la première entrée de navigation.
     Atterrir sur une liste obligerait à cliquer pour reprendre le devis qu'on
     était en train d'écrire, ce qui est la raison la plus fréquente de revenir. */
  const [tab, setTab] = useState<TabId>("editor");
  const [documents, setDocuments] = useState<PortalDocument[]>(data.documents);
  const [customers, setCustomers] = useState<PortalCustomer[]>(data.customers);
  const [categories, setCategories] = useState<StoredCategory[]>(data.categories);
  const [items, setItems] = useState<StoredCatalogItem[]>(data.items);
  const [settings, setSettings] = useState<DocSettings | null>(data.settings);
  const [issuer, setIssuer] = useState(data.issuer);
  const [openId, setOpenId] = useState<string | null>(data.documents[0]?.id ?? null);
  const [error, setError] = useState<string | null>(data.loadError);

  /* ── Un seul point d'appel réseau, pour que les erreurs se disent d'une
        seule voix et que le bandeau d'erreur ne soit écrit qu'une fois. ───── */
  const call = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T | null> => {
      try {
        const res = await fetch(url, {
          ...init,
          headers: init?.body ? { "content-type": "application/json" } : undefined,
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error ?? t.errorSave);
        setError(null);
        return payload as T;
      } catch (err) {
        setError(err instanceof Error ? err.message : t.errorSave);
        return null;
      }
    },
    [t.errorSave],
  );

  const ctx: QuotesCtx = useMemo(() => {
    const body = (extra: Record<string, unknown>) =>
      JSON.stringify({ slug: tenant.slug, lang, ...extra });

    return {
      slug: tenant.slug,
      tenant, lang, t, isAdmin,
      issuer, settings,
      documents, customers, categories, items,
      openId,
      openDocument: (doc) => { setOpenId(doc.id); setTab("editor"); },
      goTo: setTab,
      error, setError,

      async createDocument(kind) {
        const r = await call<{ document: PortalDocument }>("/api/portal/documents", {
          method: "POST", body: body({ kind }),
        });
        if (!r?.document) return null;
        setDocuments((prev) => [r.document, ...prev]);
        setOpenId(r.document.id);
        setTab("editor");
        return r.document;
      },

      async saveDocument(patch) {
        const r = await call<{ document: PortalDocument }>("/api/portal/documents", {
          method: "PATCH", body: JSON.stringify(patch),
        });
        if (!r?.document) return null;
        setDocuments((prev) => prev.map((d) => (d.id === r.document.id ? r.document : d)));
        return r.document;
      },

      async convertDocument(id) {
        const r = await call<{ document: PortalDocument }>("/api/portal/documents", {
          method: "POST", body: JSON.stringify({ convert: id }),
        });
        if (!r?.document) return null;
        setDocuments((prev) => [r.document, ...prev]);
        setOpenId(r.document.id);
        setTab("editor");
        return r.document;
      },

      /* Dupliquer = créer, puis recopier. On ne copie JAMAIS le numéro : il est
         attribué par le serveur, et deux documents portant le même numéro sont
         une faute comptable, pas un raccourci. */
      async duplicateDocument(doc) {
        const created = await call<{ document: PortalDocument }>("/api/portal/documents", {
          method: "POST", body: body({ kind: doc.kind }),
        });
        if (!created?.document) return null;
        const filled = await call<{ document: PortalDocument }>("/api/portal/documents", {
          method: "PATCH",
          body: JSON.stringify({
            id: created.document.id,
            client: doc.client,
            customerId: doc.customer_id,
            lines: doc.lines,
            notes: doc.notes,
          }),
        });
        const final = filled?.document ?? created.document;
        setDocuments((prev) => [final, ...prev]);
        setOpenId(final.id);
        setTab("editor");
        return final;
      },

      async removeDocument(id) {
        const r = await call<{ ok: boolean }>(
          `/api/portal/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" },
        );
        if (!r) return;
        setDocuments((prev) => {
          const next = prev.filter((d) => d.id !== id);
          setOpenId((cur) => (cur === id ? next[0]?.id ?? null : cur));
          return next;
        });
      },

      async saveCustomer(input, id) {
        const r = await call<{ customer: PortalCustomer }>("/api/portal/clients", {
          method: id ? "PATCH" : "POST",
          body: body(id ? { ...input, id } : input),
        });
        if (!r?.customer) return null;
        setCustomers((prev) => {
          const exists = prev.some((c) => c.id === r.customer.id);
          return exists
            ? prev.map((c) => (c.id === r.customer.id ? r.customer : c))
            : [r.customer, ...prev];
        });
        return r.customer;
      },

      async removeCustomer(id) {
        const r = await call<{ ok: boolean }>(
          `/api/portal/clients?slug=${encodeURIComponent(tenant.slug)}&id=${encodeURIComponent(id)}`,
          { method: "DELETE" },
        );
        if (r) setCustomers((prev) => prev.filter((c) => c.id !== id));
      },

      async saveCategory(input, id) {
        const r = await call<{ category: StoredCategory }>("/api/portal/catalog", {
          method: id ? "PATCH" : "POST",
          body: body({ kind: "category", ...input, ...(id ? { id } : {}) }),
        });
        if (!r?.category) return;
        setCategories((prev) => {
          const exists = prev.some((c) => c.id === r.category.id);
          const next = exists
            ? prev.map((c) => (c.id === r.category.id ? r.category : c))
            : [...prev, r.category];
          return next.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
        });
      },

      async removeCategory(id) {
        const r = await call<{ ok: boolean }>(
          `/api/portal/catalog?slug=${encodeURIComponent(tenant.slug)}&kind=category&id=${encodeURIComponent(id)}`,
          { method: "DELETE" },
        );
        if (!r) return;
        setCategories((prev) => prev.filter((c) => c.id !== id));
        // La clé étrangère est en `set null` côté base : on reflète ici plutôt
        // que de recharger, sinon les prestations resteraient rattachées à un
        // rayon qui n'existe plus.
        setItems((prev) => prev.map((i) => (i.category_id === id ? { ...i, category_id: null } : i)));
      },

      async saveItem(input, id) {
        const r = await call<{ item: StoredCatalogItem }>("/api/portal/catalog", {
          method: id ? "PATCH" : "POST",
          body: body({ kind: "item", ...input, ...(id ? { id } : {}) }),
        });
        if (!r?.item) return;
        setItems((prev) => {
          const exists = prev.some((i) => i.id === r.item.id);
          return exists
            ? prev.map((i) => (i.id === r.item.id ? r.item : i))
            : [...prev, r.item];
        });
      },

      async removeItem(id) {
        const r = await call<{ ok: boolean }>(
          `/api/portal/catalog?slug=${encodeURIComponent(tenant.slug)}&kind=item&id=${encodeURIComponent(id)}`,
          { method: "DELETE" },
        );
        if (r) setItems((prev) => prev.filter((i) => i.id !== id));
      },

      async saveSettings(input) {
        const r = await call<{ settings: DocSettings; issuer: QuotesPageData["issuer"] }>(
          "/api/portal/doc-settings", { method: "PATCH", body: body(input) },
        );
        if (!r) return;
        setSettings(r.settings);
        if (r.issuer) setIssuer(r.issuer);
      },
    };
  }, [
    tenant, lang, t, isAdmin, issuer, settings, documents, customers, categories,
    items, openId, error, call,
  ]);

  const counts: Record<TabId, number | null> = {
    editor: null,
    quotes: documents.filter((d) => d.kind === "quote").length,
    invoices: documents.filter((d) => d.kind === "invoice").length,
    clients: customers.length,
    catalog: items.length,
    dashboard: null,
    settings: null,
  };

  return (
    <QuotesProvider value={ctx}>
      <div className="esp-shell qa-shell">
        <PortalBar
          title={tenant.business} subtitle={tenant.city}
          demoHref={`/demo/${tenant.slug}`} isAdmin={isAdmin} adminHome={isAdmin}
        />

        <main className="esp-main">
          <div className="esp-wrap">
            <div className="esp-pagehead esp-print-hide" style={{ marginBottom: "1rem" }}>
              <div>
                <h1 className="esp-h1">{t.title}</h1>
                <p className="esp-lead" style={{ marginTop: "0.3rem" }}>{t.lead(issuer.trade)}</p>
              </div>
              <a className="esp-btn" href={spaceHref(tenant.slug)}>{t.backToSpace}</a>
            </div>

            {error && (
              <p className="esp-note esp-note-bad esp-print-hide" role="alert" style={{ marginBottom: "1rem" }}>
                <AlertCircle size={15} aria-hidden />
                <span>{error}</span>
              </p>
            )}

            <div className="esp-tabs qa-tabs esp-print-hide" role="tablist">
              {TABS.map(({ id, icon: Icon }) => (
                <button
                  key={id} type="button" role="tab" className="esp-tab"
                  aria-selected={tab === id} onClick={() => setTab(id)}
                >
                  <Icon size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                  {t.tab[id]}
                  {counts[id] !== null && <span className="esp-tab-count">{counts[id]}</span>}
                </button>
              ))}
            </div>

            {tab === "editor" && <EditorTab />}
            {tab === "quotes" && <ListTab kind="quote" />}
            {tab === "invoices" && <ListTab kind="invoice" />}
            {tab === "clients" && <ClientsTab />}
            {tab === "catalog" && <CatalogTab />}
            {tab === "dashboard" && <DashboardTab />}
            {tab === "settings" && <SettingsTab />}
          </div>
        </main>

        {/* Barre basse — téléphone seulement. Les quatre onglets qu'on atteint
            au pouce ; les trois autres restent accessibles en haut d'écran. */}
        <nav className="qa-bottom esp-print-hide" aria-label={t.title}>
          {TABS.filter((x) => PHONE_TABS.includes(x.id)).map(({ id, icon: Icon }) => (
            <button
              key={id} type="button" className="qa-bottom-b"
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={19} aria-hidden />
              <span>{t.tab[id]}</span>
            </button>
          ))}
        </nav>
      </div>
    </QuotesProvider>
  );
}
