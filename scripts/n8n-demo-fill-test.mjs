#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════════
   Test de remplissage : rejoue un tool call de démo pour CHACUN des 12
   assistants Vapi, contre le webhook n8n de production, puis on vérifie que
   public.demo_bookings s'est rempli côté Supabase GritUnited.

     RUN=$(date +%s) node scripts/n8n-demo-fill-test.mjs

   Vérification (projet GritUnited bbxwezoscjuwsoflponx) :

     PAT="$(grep -m1 '^SUPABASE_ACCESS_TOKEN=' /home/amscjrb/grit-united/.env | cut -d= -f2-)"
     curl -s -X POST -H "Authorization: Bearer $PAT" -H 'Content-Type: application/json' \
       -d '{"query":"select assistant_id, assistant_name, tool, count(*) from public.demo_bookings group by 1,2,3 order by 2;"}' \
       https://api.supabase.com/v1/projects/bbxwezoscjuwsoflponx/database/query

   Purge des lignes de test (elles ont toutes call_id like 'fill-%') :

     ... -d '{"query":"delete from public.demo_bookings where call_id like ''fill-%'';"}'

   Les tool_call_id sont dérivés de RUN : rejouer avec le MÊME RUN ne crée pas de
   doublon (index unique partiel demo_bookings_tool_call_id_uidx), ce qui teste
   aussi le garde-fou anti-rejeu.
   ════════════════════════════════════════════════════════════════════════════ */
const W = 'https://n8n.zerocall.io/webhook/00000000-1234-0000-4321-000000000000';
const RUN = process.env.RUN;

const A = [
 ['4cee76d9-5147-41b1-bd3b-c2c83966fdd8','Démo vitrine · Barbershop Courbevoie','barbershop-courbevoie','enregistrer_rendezvous',{prenom:'Léo',nom:'Martin',telephone:'0798765432',date:'03/09/2026',heure:'14:30',prestation:'coupe + barbe',langue:'fr'}],
 ['ec3f1db3-457a-4461-908b-0b8f065d7ec8','Démo vitrine · Ines Garden','ines-garden','enregistrer_commande',{prenom:'Marie',nom:'Dupont',telephone:'0601020304',date:'20/09/2026',heure:'10:00',pieces_souhaitees:'vase Médicis 86 cm bronze-vert',adresse_livraison:'5 rue des Lilas, 25220 Chalezeule',langue:'fr'}],
 ['e3f0641a-8860-49ae-b649-34fa8825cc72','Démo vitrine · L.A.K Nail Salon','lak-nail-salon','enregistrer_rendezvous',{prenom:'Ava',nom:'Nguyen',telephone:'9175550142',date:'09/09/2026',heure:'16:00',prestation:'gel manicure',langue:'en'}],
 ['79cf70d2-266f-4315-b684-c67f5dac7004',"Démo vitrine · L'Atelier Rosé",'onglerie','enregistrer_rendezvous',{prenom:'Chloé',nom:'Bernard',telephone:'0645332211',date:'11/09/2026',heure:'11:00',prestation:'pose semi-permanent',langue:'fr'}],
 ['07cb9db8-9944-4708-b7f8-e78f7a1ad8ec','Démo vitrine · Le Comptoir 12','restaurant','enregistrer_reservation',{prenom:'Claude',nom:'Testeur',telephone:'0612345678',date:'12/09/2026',heure:'20:00',nombre_couverts:'4',langue:'fr'}],
 ['58575546-41ba-46d3-a3f1-a277cbe6538f','Démo vitrine · Maison Brutus','barbershop','enregistrer_rendezvous',{prenom:'Hugo',nom:'Petit',telephone:'0677889900',date:'05/09/2026',heure:'18:15',prestation:'contours + soin du visage',langue:'fr'}],
 ['84f52726-b480-4fc4-800e-2b8f759aa0ec','Démo vitrine · Maison Éphémère','maison-ephemere','enregistrer_rendezvous',{prenom:'Camille',nom:'Roux',telephone:'0688991122',date:'25/09/2026',heure:'09:30',prestation:'rendez-vous découverte mariage 120 invités',langue:'fr'}],
 ['bbde8425-ff5f-42b4-9459-53ea6f5b2dfb','Démo vitrine · Maison Ferrand','traiteur','enregistrer_commande',{prenom:'Julien',nom:'Moreau',telephone:'0699001122',date:'18/09/2026',heure:'12:00',commande:'plateau apéritif 30 personnes',adresse_livraison:'14 av. Victor Hugo, 92400 Courbevoie',langue:'fr'}],
 ['da471536-e59a-4435-bfbe-ba35975f3913','Démo vitrine · Open House','openhouse-canggu','enregistrer_reservation',{prenom:'Sarah',nom:'Wilson',telephone:'628123456789',date:'14/09/2026',heure:'19:00',nombre_couverts:'6',langue:'en'}],
 ['61b42505-e008-4912-9912-2d70a2c2d27e','Démo vitrine · Plomberie Mercier','plombier','enregistrer_intervention',{prenom:'Nadia',nom:'Lambert',telephone:'0633445566',date:'02/09/2026',heure:'08:00',nature_probleme:'fuite sous évier',adresse_intervention:'8 rue de la Paix, 75002 Paris',urgence:true,langue:'fr'}],
 ['fc5b038f-ac4e-4ac8-a75f-fdca2364c2ca','Démo vitrine · Texas Plumbing Pros','texas-plumbing-pros','enregistrer_intervention',{prenom:'John',nom:'Doe',telephone:'9035551234',date:'09/03/2026',heure:'09:00',nature_probleme:'water heater failure',adresse_intervention:'120 Main St, Gun Barrel City TX',urgence:true,langue:'en'}],
 ['5fc79895-d15a-4a71-869a-186f0aa91511','Démo vitrine · Thaï Vien Express','thai-viens-express','enregistrer_reservation',{prenom:'Sophie',nom:'Tran',telephone:'0655443322',date:'16/09/2026',heure:'19:30',nombre_couverts:'3',langue:'fr'}],
];

let ok = 0, ko = 0;
for (const [id, name, slug, tool, args] of A) {
  // On alterne objet / string JSON : Vapi envoie les deux formes selon le modèle.
  const argsField = Math.random() < 0.5 ? args : JSON.stringify(args);
  const body = { message: { type: 'tool-calls',
    assistant: { id, name, metadata: { slug } },
    call: { id: `fill-${RUN}-${slug}`, createdAt: new Date().toISOString() },
    toolCalls: [{ id: `tc-fill-${RUN}-${slug}`, type: 'function', function: { name: tool, arguments: argsField } }] } };
  const t0 = Date.now();
  try {
    const r = await fetch(W, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    const res = j?.results?.[0]?.result;
    const good = r.status === 200 && j?.results?.[0]?.toolCallId === `tc-fill-${RUN}-${slug}` && !!res;
    good ? ok++ : ko++;
    console.log(`${good ? '✅' : '❌'} ${String(Date.now() - t0).padStart(5)}ms  ${slug.padEnd(22)} ${tool.padEnd(24)} ${typeof argsField === 'string' ? 'args:string' : 'args:object'}  ${res ?? JSON.stringify(j)}`);
  } catch (e) { ko++; console.log(`❌ ${slug} ${e}`); }
}
console.log(`\n${ok} OK / ${ko} KO sur ${A.length}`);
