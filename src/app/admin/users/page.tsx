
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role, User } from '@prisma/client';
import type { SearchParams } from '@/types/next';
import { UsersDataTable } from './_components/data-table';
import { UserFilters } from './_components/user-filters';
import prisma from '@/lib/prisma';


async function getUsers({ search, sort, page, per_page, role }: {
  search: string
  sort: string
  page: string
  per_page: string
  role?: Role | 'all'
}) {
  const pageNumber = parseInt(page) || 1;
  const perPageNumber = parseInt(per_page) || 10;
  // Default to 'createdAt' if an invalid sort column is provided
  const [column = 'createdAt', order = 'desc'] = sort?.split(".") ?? [];
  const validSortColumns = ['name', 'email', 'role', 'createdAt'];

  let where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role && role !== 'all') {
    where.role = role;
  }
  
  const orderBy = validSortColumns.includes(column) ? { [column]: order } : { createdAt: 'desc' };

  try {
    const users: User[] = await prisma.user.findMany({
      where,
      orderBy,
      skip: (pageNumber - 1) * perPageNumber,
      take: perPageNumber,
    })

    const totalUsers = await prisma.user.count({ where });

    return {
      data: users,
      pageCount: Math.ceil(totalUsers / perPageNumber)
    }
  } catch (error) {
    // This can happen if an invalid sort column is passed, for example.
    console.error("Failed to fetch users:", error);
    return { data: [], pageCount: 0 };
  }
}

export default async function AdminUsersPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10", role } = searchParams;

  const { data, pageCount } = await getUsers({
    search: String(search),
    sort: String(sort),
    page: String(page),
    per_page: String(per_page),
    role: role as Role | 'all'
  });

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
        columns={columns}
        data={data}
        pageCount={pageCount}
        searchKey="name"
      />
    </div>
  );
}
