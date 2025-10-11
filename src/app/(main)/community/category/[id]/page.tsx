
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getCategory(id: string) {
    return prisma.forumCategory.findUnique({ where: { id }});
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategory(params.id);

  if (!category) {
    notFound();
  }

  return (
    <div className="container py-12">
        <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline">{category.name}</h1>
            <p className="text-muted-foreground mt-2">{category.description}</p>
        </div>

        <div className="flex justify-end mb-6">
            <Button disabled>New Topic</Button>
        </div>

        <Card>
            <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                    <MessageSquare className="h-16 w-16 mb-4" />
                    <h3 className="text-xl font-semibold">Topics Coming Soon</h3>
                    <p className="mt-2 max-w-md">The functionality to view and create topics is under construction.</p>
                     <Button asChild variant="secondary" className="mt-6">
                        <Link href="/community">Back to Forums</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
