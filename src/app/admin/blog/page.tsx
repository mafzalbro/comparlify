
'use server';

import Link from "next/link";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { SearchParams } from '@/types/next';
import { BlogPostsDataTable } from './_components/data-table';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AdminBlogPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10" } = searchParams;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/admin/blog/categories">Manage Categories</Link>
            </Button>
            <Button asChild>
                <Link href="/admin/blog/new"><PlusCircle className="mr-2 h-4 w-4" />Create New Post</Link>
            </Button>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <BlogPostsDataTable 
          search={String(search)}
          sort={String(sort)}
          page={String(page)}
          per_page={String(per_page)}
        />
      </Suspense>
    </div>
  );
}
