
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { SearchParams } from '@/types/next';
import { ComparisonsDataTable } from './_components/data-table';

export default async function AdminComparisonsPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10" } = searchParams;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Comparisons</h1>
        <Button asChild>
          <Link href="/admin/comparisons/new"><PlusCircle className="mr-2 h-4 w-4" />Create New Comparison</Link>
        </Button>
      </div>
      
       <ComparisonsDataTable 
        search={search}
        sort={sort}
        page={page}
        per_page={per_page}
      />
    </div>
  );
}
