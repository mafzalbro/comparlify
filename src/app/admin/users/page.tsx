
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role } from '@prisma/client';
import type { SearchParams } from '@/types/next';
import { UsersDataTable } from './_components/data-table';
import { UserFilters } from './_components/user-filters';


export default async function AdminUsersPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10", role } = searchParams;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <UserFilters initialSearch={String(search)} initialRole={role as string} />
        </CardContent>
      </Card>
      
      <UsersDataTable
        search={String(search)}
        sort={String(sort)}
        page={String(page)}
        per_page={String(per_page)}
        role={role as Role | "all"}
      />
    </div>
  );
}
