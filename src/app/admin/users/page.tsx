
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import type { Role } from '@prisma/client';
import type { SearchParams } from '@/types/next';
import { UsersDataTable } from './_components/data-table';
import Link from 'next/link';


export default async function AdminUsersPage(
  { searchParams }: { searchParams: SearchParams }
) {
  const { search = "", sort = "createdAt.desc", page = "1", per_page = "10", role } = searchParams;

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
      
      <UsersDataTable
        search={search}
        sort={sort}
        page={page}
        per_page={per_page}
        role={role as Role | "all"}
      />
    </div>
  );
}
