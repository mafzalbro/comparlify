
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';
import type { User, Role } from '@prisma/client';

async function getUsers({
  search,
  role,
  sortBy,
  sortOrder,
}: {
  search?: string;
  role?: Role | 'all';
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}) {
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

  let orderBy: any = { createdAt: 'desc' };
  if (sortBy && sortOrder) {
    orderBy = { [sortBy]: sortOrder };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy,
  });
  return users;
}

const SortableHeader = ({
    column,
    label,
    currentSortBy,
    currentSortOrder,
    baseUrl
}: {
    column: keyof User;
    label: string;
    currentSortBy?: keyof User;
    currentSortOrder?: 'asc' | 'desc';
    baseUrl: string;
}) => {
    const isSorting = currentSortBy === column;
    const newSortOrder = isSorting && currentSortOrder === 'asc' ? 'desc' : 'asc';
    const href = `${baseUrl}&sortBy=${column}&sortOrder=${newSortOrder}`;

    return (
         <Button variant="ghost" asChild>
            <Link href={href}>
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Link>
        </Button>
    )
}

export default async function AdminUsersPage(
  props: {
    searchParams: Promise<{
      search?: string;
      role?: Role | 'all';
      sortBy?: keyof User;
      sortOrder?: 'asc' | 'desc';
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const { search, role, sortBy, sortOrder } = searchParams;
  const users = await getUsers({ search, role, sortBy, sortOrder });

  const baseUrl = `/admin/users?search=${search || ''}&role=${role || 'all'}`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search"
                  name="search"
                  placeholder="Search by name or email..."
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Filter by Role</Label>
              <Select name="role" defaultValue={role ?? 'all'}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full">Apply</Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/users">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>
                  <SortableHeader column="role" label="Role" currentSortBy={sortBy} currentSortOrder={sortOrder} baseUrl={baseUrl} />
              </TableHead>
               <TableHead>
                  <SortableHeader column="newsletter" label="Subscribed" currentSortBy={sortBy} currentSortOrder={sortOrder} baseUrl={baseUrl} />
              </TableHead>
              <TableHead>
                 <SortableHeader column="createdAt" label="Joined" currentSortBy={sortBy} currentSortOrder={sortOrder} baseUrl={baseUrl} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                 <TableCell>
                    {user.newsletter ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
             {users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        No users found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
