"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/lib/lang-context";
import { CalendarCheck, Clock, ImageIcon, Search, Sparkles, Wallet } from "lucide-react";

// One icon per FAQ topic (timing · assets · self-edit · booking · SEO · cost).
const ICONS = [Clock, ImageIcon, Sparkles, CalendarCheck, Search, Wallet];

export default function Faq() {
  const t = useT();
  return (
    <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
      {t.faq.items.map((it, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <AccordionItem value={`faq-${i}`} key={i} className="py-2">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="flex items-center gap-3">
                <Icon
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-[color:var(--vermilion)]"
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {it.q}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent
              className="ps-9 pb-3 text-muted-foreground"
              style={{ fontSize: "0.98rem", maxWidth: "62ch" }}
            >
              {it.a}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
