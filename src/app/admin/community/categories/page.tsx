
import prisma from '@/lib/prisma';
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DeleteForumCategoryButton } from './_components/delete-forum-category-button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

async function getCategories() {
  const categories = await prisma.forumCategory.findMany({
    include: {
        _count: {
            select: { topics: true }
        }
    },
    orderBy: {
      name: 'asc',
    },
  });
  return categories;
}

export default async function AdminForumCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/admin/community"><ArrowLeft className="mr-2 h-4 w-4" />Back to Moderation</Link>
            </Button>
        </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Forum Categories</h1>
        <Button asChild>
          <Link href="/admin/community/categories/new"><PlusCircle className="mr-2 h-4 w-4"/>Create New Category</Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Topic Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category) => (
                <TableRow key={category.id}>
                    <TableCell className="font-medium">
                        <Link href={`/admin/community/categories/edit/${category.id}`} className="hover:underline">{category.name}</Link>
                    </TableCell>
                     <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">{category.slug}</span>
                    </TableCell>
                    <TableCell>
                        {category._count.topics}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/community/categories/edit/${category.id}`}>Edit</Link>
                    </Button>
                    <DeleteForumCategoryButton id={category.id} />
                    </TableCell>
                </TableRow>
                ))}
                 {categories.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        No categories found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
