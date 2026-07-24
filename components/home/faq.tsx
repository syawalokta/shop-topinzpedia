import { FAQS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeUp } from "@/components/shared/motion";

export function Faq() {
  return (
    <section id="faq" className="py-16 md:py-24" aria-labelledby="faq-heading">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Pertanyaan yang Sering Diajukan"
            description="Masih ragu? Mungkin jawabannya sudah ada di sini. Kalau belum, admin kami siap menjawab via WhatsApp."
          />

          <FadeUp delay={0.1} className="mt-8 md:mt-10">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={faq.q}
                  value={`faq-${index}`}
                  className="rounded-lg border border-b bg-card px-5 shadow-soft transition-colors last:border-b data-[state=open]:border-primary/40"
                >
                  <AccordionTrigger className="py-4 text-sm font-medium hover:no-underline md:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
