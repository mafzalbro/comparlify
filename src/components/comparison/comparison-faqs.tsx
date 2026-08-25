import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ComparisonFaqsProps {
  faqs: FaqItem[];
}

export function ComparisonFaqs({ faqs }: ComparisonFaqsProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="space-y-8 mt-16">
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
        Frequently Asked <span className="text-primary italic">Questions</span>
      </h2>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={faq.id}
            value={`item-${idx}`}
            className="border border-border/40 rounded-2xl bg-card/40 backdrop-blur-md hover:border-border/60 transition-colors px-6 py-2 group"
          >
            <AccordionTrigger className="text-base font-extrabold tracking-tight text-left hover:text-primary transition-colors hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 font-medium">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
