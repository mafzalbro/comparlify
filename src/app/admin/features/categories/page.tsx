
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
import { DeleteFeatureCategoryButton } from './_components/delete-feature-category-button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

async function getFeatureCategories() {
  const categories = await prisma.featureCategory.findMany({
    include: {
        _count: {
            select: { features: true }
        }
    },
    orderBy: {
      name: 'asc',
    },
  });
  return categories;
}

export default async function AdminFeatureCategoriesPage() {
  const categories = await getFeatureCategories();

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/admin/features"><ArrowLeft className="mr-2 h-4 w-4" />Back to Features</Link>
            </Button>
        </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Feature Categories</h1>
        <Button asChild>
          <Link href="/admin/features/categories/new"><PlusCircle className="mr-2 h-4 w-4"/>Create New Category</Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Feature Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category) => (
                <TableRow key={category.id}>
                    <TableCell className="font-medium">
                        <Link href={`/admin/features/categories/edit/${category.id}`} className="hover:underline">{category.name}</Link>
                    </TableCell>
                    <TableCell>
                        {category._count.features}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/features/categories/edit/${category.id}`}>Edit</Link>
                    </Button>
                    <DeleteFeatureCategoryButton id={category.id} />
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
