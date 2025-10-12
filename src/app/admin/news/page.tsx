'use server';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { SearchParams } from '@/types/next';
import { NewsArticlesDataTable } from './_components/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default async function AdminNewsPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10" } = searchParams;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage News Articles</h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/admin/news/new"><PlusCircle className="mr-2 h-4 w-4" />Create New Article</Link>
            </Button>
        </div>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>News Articles</CardTitle>
          <CardDescription>
            Manage articles about news and trends in the tech world.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <NewsArticlesDataTable 
                search={String(search)}
                sort={String(sort)}
                page={String(page)}
                per_page={String(per_page)}
            />
        </CardContent>
      </Card>
    </div>
  );
}
