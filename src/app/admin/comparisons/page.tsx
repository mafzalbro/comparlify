
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { SearchParams } from '@/types/next';
import { ComparisonsDataTable } from './_components/data-table';

export default async function AdminComparisonsPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
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
        search={String(search)}
        sort={String(sort)}
        page={String(page)}
        per_page={String(per_page)}
      />
    </div>
  );
}
