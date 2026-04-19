
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
import { DeleteComparisonCategoryButton } from './_components/delete-comparison-category-button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

async function getCategories() {
  const categories = await prisma.comparisonCategory.findMany({
    include: {
        _count: {
            select: { comparisons: true }
        }
    },
    orderBy: {
      name: 'asc',
    },
  });
  return categories;
}

export default async function AdminComparisonCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/admin/comparisons"><ArrowLeft className="mr-2 h-4 w-4" />Back to Comparisons</Link>
            </Button>
        </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Comparison Categories</h1>
        <Button asChild>
          <Link href="/admin/comparisons/categories/new"><PlusCircle className="mr-2 h-4 w-4"/>Create New Category</Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Comparison Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category) => (
                <TableRow key={category.id}>
                    <TableCell className="font-medium">
                        <Link href={`/admin/comparisons/categories/edit/${category.id}`} className="hover:underline">{category.name}</Link>
                    </TableCell>
                     <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">{category.slug}</span>
                    </TableCell>
                    <TableCell>
                        {category._count.comparisons}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/comparisons/categories/edit/${category.id}`}>Edit</Link>
                    </Button>
                    <DeleteComparisonCategoryButton id={category.id} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
