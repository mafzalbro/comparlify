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
    <section className="space-y-16 mt-32">
      <h2 className="text-4xl font-black uppercase tracking-tighter">
        Frequently Asked <span className="text-primary italic">Questions</span>
      </h2>
      <Accordion type="single" collapsible className="w-full space-y-6">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={faq.id}
            value={`item-${idx}`}
            className="border border-border/10 rounded-[2rem] bg-card/20 backdrop-blur-md px-8 py-4 group hover:border-primary/20"
          >
            <AccordionTrigger className="text-xl font-black tracking-tight text-left hover:text-primary transition-colors hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-4 font-medium">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
