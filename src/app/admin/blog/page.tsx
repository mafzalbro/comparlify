
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogPostsDataTable } from './_components/data-table';
import { PlusCircle } from 'lucide-react';
import type { SearchParams } from '@/types/next';

export default function AdminBlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10" } = searchParams;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new"><PlusCircle className="mr-2 h-4 w-4" />Create New Post</Link>
        </Button>
      </div>
      
      <BlogPostsDataTable 
        search={String(search)}
        sort={String(sort)}
        page={String(page)}
        per_page={String(per_page)}
      />
    </div>
  );
}
