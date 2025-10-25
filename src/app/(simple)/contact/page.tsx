
import { getContent } from '@/lib/content';
import { Breadcrumbs } from '@/components/breadcrumb';
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactFormSection } from './_components/contact-form-section';

export default async function ContactPage() {
  const content = await getContent();

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Contact' },
        ]}
        className="mb-8"
      />
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            {content['contact.hero.title']}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            {content['contact.hero.subtitle']}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">{content['contact.email.title']}</h3>
                <p className="text-muted-foreground">{content['contact.email.description']}</p>
                <a href={`mailto:${content['contact.email.value']}`} className="text-primary font-medium hover:underline">{content['contact.email.value']}</a>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">{content['contact.phone.title']}</h3>
                <p className="text-muted-foreground">{content['contact.phone.description']}</p>
                <a href={`tel:${content['contact.phone.value']}`} className="text-primary font-medium hover:underline">{content['contact.phone.value']}</a>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold">{content['contact.office.title']}</h3>
                <p className="text-muted-foreground whitespace-pre-line">{content['contact.office.description']}</p>
              </div>
            </div>
          </div>
          
          <ContactFormSection />
        </div>
      </div>
    </div>
  )
}
