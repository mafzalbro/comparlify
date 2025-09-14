
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import type { SearchParams } from '@/types/next';
import { allTools, categories, type Tool, type ToolCategory } from './tools';
import { Input } from '@/components/ui/input';

// SEO metadata can still be generated on the server for the main page
export const metadata: Metadata = generateSeoMetadata({
  title: 'AI Creator Tools',
  description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
  path: '/tools'
});

function CategoryButton({ category, selectedCategory, onClick }: { category: ToolCategory | 'All', selectedCategory: string, onClick: (category: string) => void }) {
  const isSelected = category.toLowerCase() === selectedCategory.toLowerCase();
  return (
    <Button 
      variant={isSelected ? 'default' : 'ghost'} 
      className="rounded-md"
      onClick={() => onClick(category)}
    >
      {category}
    </Button>
  )
}

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = allTools.filter(tool => {
    const categoryMatch = selectedCategory === 'All' || tool.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
                        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Creator Tools',
    description: 'A suite of intelligent tools designed to streamline your course creation workflow, from outlining content to marketing.',
    itemListElement: allTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: tool.title,
        description: tool.description,
        url: `https://www.comparlify.com${tool.href}`, // Replace with actual domain
        provider: {
          '@type': 'Organization',
          name: 'Comparlify',
        },
      },
    })),
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <div className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
            AI-Powered Creator Tools
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            A suite of intelligent tools designed to streamline your workflow and amplify your success.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div className="flex-1 relative w-full md:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search tools..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
            <CategoryButton category="All" selectedCategory={selectedCategory} onClick={setSelectedCategory} />
            {categories.map((category) => (
              <CategoryButton key={category} category={category} selectedCategory={selectedCategory} onClick={setSelectedCategory} />
            ))}
          </div>
        </div>

        {filteredTools.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTools.map((tool, index) => (
              <div key={tool.slug} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                <Card className="flex flex-col h-full group overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 shadow-md hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="bg-primary/20 p-3 rounded-lg">
                        <tool.Icon className="h-8 w-8 text-primary" />
                      </div>
                      <Badge variant="outline">{tool.category}</Badge>
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{tool.description}</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild className="w-full group-hover:bg-primary/90 transition-colors" disabled={tool.href === '#'}>
                      <Link href={tool.href}>
                        {tool.href === '#' ? 'Coming Soon' : 'Launch Tool'}
                        {tool.href !== '#' && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <h3 className="text-2xl font-headline mb-2">No Tools Found</h3>
            <p>Your search for "{searchTerm}" in the "{selectedCategory}" category didn't return any results.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
