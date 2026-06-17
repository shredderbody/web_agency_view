#!/usr/bin/env node
/**
 * vapi-export.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * Exporte les assistants Vapi DE CE PROJET (web_agency_view) et leurs tools
 * vers ./vapi_export/, dans le même format que ~/receptionist/vapi_export/
 * (un fichier JSON par assistant / par fonction + index).
 *
 * Le compte Vapi est partagé avec le projet « receptionist » : on ne garde donc
 * que les assistants dont metadata.project === "web_agency_view" (les
 * « Démo vitrine · … » créés par scripts/vapi-setup-assistants.mjs). Les
 * assistants du projet receptionist restent exportés dans ~/receptionist/vapi_export/.
 *
 * Les assistants de démo embarquent leurs tools EN INLINE (model.tools), et non
 * via model.toolIds : la dossier functions/ contient donc les définitions inline
 * extraites (dédupliquées par nom), pour servir de modèles réutilisables.
 *
 * Usage :
 *   VAPI_PRIVATE_KEY=xxx node scripts/vapi-export.mjs
 *   (sinon la clé est lue depuis .env : VAPI_PRIVATE_KEY)
 * ──────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "vapi_export");
const PROJECT = "web_agency_view";

function readEnv() {
  try {
    const raw = readFileSync(join(ROOT, ".env"), "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return env;
  } catch { return {}; }
}
const env = readEnv();
const KEY = process.env.VAPI_PRIVATE_KEY || env.VAPI_PRIVATE_KEY || env.VITE_VAPI_PRIVATE_KEY;
if (!KEY) { console.error("✗ VAPI_PRIVATE_KEY manquante (ni en env, ni dans .env)."); process.exit(1); }

const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const id8 = (s) => s.slice(0, 8);
const hash8 = (obj) => createHash("sha1").update(JSON.stringify(obj)).digest("hex").slice(0, 8);
const pretty = (obj) => JSON.stringify(obj, null, 2) + "\n";

async function vapiGet(path) {
  const res = await fetch(`https://api.vapi.ai${path}`, { headers: { Authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`GET ${path}: HTTP ${res.status} — ${await res.text()}`);
  return res.json();
}

const allAssistants = await vapiGet("/assistant?limit=1000");
const assistants = allAssistants
  .filter((a) => (a.metadata || {}).project === PROJECT)
  .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

if (!assistants.length) { console.error(`✗ Aucun assistant metadata.project="${PROJECT}".`); process.exit(1); }

// ── Reset propre du dossier ────────────────────────────────────────────────
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "assistants"), { recursive: true });
mkdirSync(join(OUT, "functions"), { recursive: true });

// ── Extraction des tools inline (dédup par nom) ────────────────────────────
const toolsByName = new Map(); // name → { type, name, id8, def, usedBy:Set }
const toolName = (t) => (t.function?.name) || t.type;
for (const a of assistants) {
  for (const t of (a.model?.tools || [])) {
    const name = toolName(t);
    if (!toolsByName.has(name)) {
      toolsByName.set(name, { type: t.type, name, id8: hash8(t), def: t, usedBy: new Set() });
    }
    toolsByName.get(name).usedBy.add(a.metadata?.slug || slugify(a.name));
  }
}
const tools = [...toolsByName.values()].sort((a, b) => a.name.localeCompare(b.name));

// ── Écriture des fichiers fonctions ────────────────────────────────────────
for (const t of tools) {
  const file = `${t.type}__${slugify(t.name)}__${t.id8}.json`;
  writeFileSync(join(OUT, "functions", file), pretty(t.def));
}
writeFileSync(
  join(OUT, "functions", "_index.json"),
  pretty(tools.map((t) => ({ id8: t.id8, type: t.type, name: t.name, inline: true, usedBy: [...t.usedBy].sort() })))
);
writeFileSync(
  join(OUT, "functions", "_index.md"),
  `# Index des fonctions (tools)\n\n` +
  `Tools définis **en inline** dans \`model.tools\` des assistants de démo ` +
  `(pas de \`toolId\` Vapi : l'\`id8\` ci-dessous est un hash du contenu).\n\n` +
  `| id8 | type | nom | utilisé par |\n|-----|------|-----|-------------|\n` +
  tools.map((t) => `| \`${t.id8}\` | ${t.type} | **${t.name}** | ${[...t.usedBy].sort().join(", ")} |`).join("\n") + "\n"
);

// ── Écriture des fichiers assistants + index ───────────────────────────────
const idxRows = [];
for (const a of assistants) {
  const file = `${slugify(a.name)}__${id8(a.id)}.json`;
  writeFileSync(join(OUT, "assistants", file), pretty(a));
  const m = a.model || {};
  const model = m.provider && m.model ? `${m.provider}/${m.model}` : (m.model || "—");
  const nTools = (m.tools || []).length;
  idxRows.push(`| \`${a.id}\` | ${a.name} | ${model} | ${a.voice?.provider || "—"} | ${a.transcriber?.provider || "—"} | ${nTools} | ${(a.metadata || {}).slug || "—"} |`);
}
writeFileSync(
  join(OUT, "assistants", "_index.md"),
  `# Index des assistants — projet ${PROJECT}\n\n` +
  `| id | nom | model | voice | transcriber | #tools (inline) | slug démo |\n` +
  `|----|-----|-------|-------|-------------|-----------------|-----------|\n` +
  idxRows.join("\n") + "\n"
);

console.error(`✓ Export : ${assistants.length} assistants, ${tools.length} tools inline → ${OUT}`);
for (const a of assistants) console.error(`  · ${slugify(a.name)}__${id8(a.id)}.json  (${(a.metadata || {}).slug})`);
