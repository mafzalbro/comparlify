import Image from 'next/image';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { ManagedImage } from '@/components/managed-image';

export const metadata: Metadata = generateSeoMetadata({
    title: 'About Us',
    description: 'Empowering course creators with clarity and confidence. Learn about the mission behind Comparlify.',
    path: '/about'
});

export default function AboutPage() {
  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            Our Mission
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Empowering course creators with clarity and confidence.
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto text-foreground">
          <ManagedImage 
            src="https://picsum.photos/800/400"
            alt="A team of creators collaborating"
            data-ai-hint="team collaboration"
            width={800}
            height={400}
            className="rounded-lg mb-8 shadow-md"
          />
          <p>
            Comparlify was born from a simple observation: the world of online course creation is both exciting and overwhelming. With countless platforms, tools, and strategies available, creators often find themselves lost in a sea of options, spending more time on research than on what they do best—creating amazing content.
          </p>
          <p>
            We decided to change that. Our mission is to be the trusted guide for every course creator. We provide unbiased, in-depth comparisons, innovative AI-powered tools, and actionable insights to help you make informed decisions, save time, and accelerate your growth.
          </p>
          <blockquote>
            "We believe that every creator, regardless of their technical skill or budget, deserves a clear path to success."
          </blockquote>
          <p>
            From solo entrepreneurs just starting out to established educational businesses looking to optimize their stack, Comparlify is here to support you at every step of your journey. We're passionate about education and technology, and we're committed to building a resource that truly serves the creator community.
          </p>
          <p>
            Thank you for being here. Let's build something great together.
          </p>
        </div>
      </div>
    </div>
  );
}
