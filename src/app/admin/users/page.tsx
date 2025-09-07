
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
import { Search, ArrowUpDown } from 'lucide-react';
import type { User, Role } from '@prisma/client';

async function getUsers({
  search,
  role,
  sortBy,
  sortOrder,
}: {
  search?: string;
  role?: Role;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}) {
  let where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    role?: Role | 'all';
    sortBy?: keyof User;
    sortOrder?: 'asc' | 'desc';
  };
}) {
  const users = await getUsers({
      ...searchParams,
      role: searchParams.role === 'all' ? undefined : searchParams.role,
  });

  const baseUrl = `/admin/users?search=${searchParams.search || ''}&role=${searchParams.role || ''}`;

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
                  defaultValue={searchParams.search}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Filter by Role</Label>
              <Select name="role" defaultValue={searchParams.role ?? 'all'}>
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
                  <SortableHeader column="role" label="Role" currentSortBy={searchParams.sortBy} currentSortOrder={searchParams.sortOrder} baseUrl={baseUrl} />
              </TableHead>
              <TableHead>
                 <SortableHeader column="createdAt" label="Joined" currentSortBy={searchParams.sortBy} currentSortOrder={searchParams.sortOrder} baseUrl={baseUrl} />
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
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
             {users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
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
