/* Libellés de l'outil de devis, dans les deux langues du site.

   Volontairement à part de `lib/i18n.ts` : ce dictionnaire-là sert le SITE
   PUBLIC (660 lignes, chargé par chaque vitrine). L'outil de devis est un
   espace protégé, ouvert par une poignée de gens ; son vocabulaire n'a rien à
   faire dans le bundle d'une page vitrine. */

import type { Lang } from "../i18n";

export type DocStrings = typeof FR;

const FR = {
  title: "Devis & factures",
  lead: (trade: string) => `${trade} — vos documents, à vos couleurs et à vos tarifs.`,
  tabs: { quote: "Devis", invoice: "Factures" },
  newQuote: "Nouveau devis",
  newInvoice: "Nouvelle facture",
  creating: "Création…",

  // Liste
  colNumber: "Numéro",
  colDate: "Date",
  colClient: "Client",
  colTotal: "Total TTC",
  colStatus: "Statut",
  emptyQuoteT: "Aucun devis",
  emptyQuoteD: "Créez-en un : les prestations de votre carte sont déjà chargées, il n'y a qu'à choisir.",
  emptyInvoiceT: "Aucune facture",
  emptyInvoiceD: "Une facture naît d'un devis accepté, ou se crée directement.",
  noClient: "Sans destinataire",

  // Éditeur
  back: "Retour à la liste",
  clientTitle: "Destinataire",
  clientName: "Nom",
  clientEmail: "E-mail",
  clientPhone: "Téléphone",
  clientAddress: "Adresse",
  clientPostal: "Code postal",
  clientCity: "Ville",
  pickContact: "Reprendre un client connu",
  pickContactHint: "Les personnes qui ont déjà appelé votre standardiste.",

  linesTitle: "Lignes",
  addLine: "Ligne libre",
  addDiscount: "Remise",
  catalogTitle: "Votre carte",
  catalogHint: "Un clic pose la ligne, prix compris.",
  catalogToQuote: "à chiffrer",
  colDesignation: "Désignation",
  colQty: "Qté",
  colUnit: "P.U. HT",
  colTax: "Taxe",
  colLineTotal: "Total HT",
  discountLine: "Remise commerciale",
  removeLine: "Retirer cette ligne",
  noLines: "Aucune ligne. Choisissez une prestation dans votre carte, ou ajoutez une ligne libre.",

  notesTitle: "Notes",
  notesHint: "Ce que vous voulez dire au client — visible sur le document.",

  subtotal: "Sous-total HT",
  discount: "Remise",
  totalHT: "Total HT",
  totalTTC: "Total TTC",

  dates: "Dates",
  issuedOn: "Émis le",
  validUntil: "Valable jusqu'au",
  dueOn: "À régler avant le",

  save: "Enregistrer",
  saving: "Enregistrement…",
  saved: "Enregistré",
  unsaved: "Modifications non enregistrées",
  leaveConfirm: "Des modifications ne sont pas enregistrées. Quitter quand même ?",
  backToSpace: "Espace de suivi",
  print: "Imprimer / PDF",
  convert: "Créer la facture",
  converting: "Création…",
  del: "Supprimer",
  delConfirm: "Supprimer définitivement ce document ?",
  statusLabel: "Statut",
  convertedFrom: "Établie d'après le devis",

  // Document
  quoteWord: "Devis",
  invoiceWord: "Facture",
  issuerWord: "Émetteur",
  recipientWord: "Client",
  numberWord: "N°",
  signature: "Bon pour accord — date et signature",
  page: "Document établi par",

  errorSave: "Enregistrement impossible.",
  errorLoad: "Données indisponibles.",
};

const EN: DocStrings = {
  title: "Quotes & invoices",
  lead: (trade: string) => `${trade} — your documents, in your colours and at your prices.`,
  tabs: { quote: "Quotes", invoice: "Invoices" },
  newQuote: "New quote",
  newInvoice: "New invoice",
  creating: "Creating…",

  colNumber: "Number",
  colDate: "Date",
  colClient: "Client",
  colTotal: "Total",
  colStatus: "Status",
  emptyQuoteT: "No quotes yet",
  emptyQuoteD: "Create one — your price list is already loaded, you only have to pick.",
  emptyInvoiceT: "No invoices yet",
  emptyInvoiceD: "An invoice comes from an accepted quote, or is created directly.",
  noClient: "No recipient",

  back: "Back to list",
  clientTitle: "Recipient",
  clientName: "Name",
  clientEmail: "Email",
  clientPhone: "Phone",
  clientAddress: "Address",
  clientPostal: "Postcode",
  clientCity: "City",
  pickContact: "Reuse a known client",
  pickContactHint: "People who have already called your receptionist.",

  linesTitle: "Lines",
  addLine: "Free line",
  addDiscount: "Discount",
  catalogTitle: "Your price list",
  catalogHint: "One click drops the line in, price included.",
  catalogToQuote: "to be priced",
  colDesignation: "Description",
  colQty: "Qty",
  colUnit: "Unit price",
  colTax: "Tax",
  colLineTotal: "Line total",
  discountLine: "Commercial discount",
  removeLine: "Remove this line",
  noLines: "No lines yet. Pick something from your price list, or add a free line.",

  notesTitle: "Notes",
  notesHint: "Anything you want to tell the client — printed on the document.",

  subtotal: "Subtotal",
  discount: "Discount",
  totalHT: "Net total",
  totalTTC: "Total due",

  dates: "Dates",
  issuedOn: "Issued on",
  validUntil: "Valid until",
  dueOn: "Payable by",

  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  unsaved: "Unsaved changes",
  leaveConfirm: "Some changes are not saved. Leave anyway?",
  backToSpace: "Dashboard",
  print: "Print / PDF",
  convert: "Create invoice",
  converting: "Creating…",
  del: "Delete",
  delConfirm: "Delete this document for good?",
  statusLabel: "Status",
  convertedFrom: "Issued from quote",

  quoteWord: "Quote",
  invoiceWord: "Invoice",
  issuerWord: "From",
  recipientWord: "Bill to",
  numberWord: "No.",
  signature: "Agreed — date and signature",
  page: "Document issued by",

  errorSave: "Could not save.",
  errorLoad: "Data unavailable.",
};

export function docStrings(lang: Lang): DocStrings {
  return lang === "en" ? EN : FR;
}
