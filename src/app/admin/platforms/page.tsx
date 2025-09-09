
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { SearchParams } from '@/types/next';
import { PlusCircle } from 'lucide-react';
import { PlatformsDataTable } from './_components/data-table';


export default function AdminPlatformsPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", sort = "name.asc", page = "1", per_page = "10" } = searchParams;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Platforms</h1>
        <Button asChild>
          <Link href="/admin/platforms/new"><PlusCircle className="mr-2 h-4 w-4" />Create New Platform</Link>
        </Button>
      </div>
      
      <PlatformsDataTable 
        search={String(search)}
        sort={String(sort)}
        page={String(page)}
        per_page={String(per_page)}
      />
    </div>
  );
}
