
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DeleteFeatureButton } from './_components/delete-feature-button';
import { PlusCircle } from 'lucide-react';

async function getFeatures() {
  const features = await prisma.feature.findMany({
    include: {
      category: true,
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' },
    ],
  });

  const groupedFeatures = features.reduce((acc: Record<string, typeof features>, feature: any) => {
    const categoryName = feature.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  return groupedFeatures;
}

export default async function AdminFeaturesPage() {
  const groupedFeatures = await getFeatures();
  const categories = Object.keys(groupedFeatures).sort();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Features</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/admin/features/categories">Manage Categories</Link>
            </Button>
            <Button asChild>
                <Link href="/admin/features/new"><PlusCircle className="mr-2 h-4 w-4" /> Create New Feature</Link>
            </Button>
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>About Features</CardTitle>
            <CardDescription>
                Features are the individual capabilities you want to compare across different platforms (e.g., "Integrated Video Hosting", "Drip Content"). They must belong to a category. You can manage the categories themselves using the button above.
            </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-8">
        {categories.length > 0 ? categories.map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedFeatures[category].map((feature: any) => (
                    <TableRow key={feature.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/features/edit/${feature.id}`} className="hover:underline">
                          {feature.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/features/edit/${feature.id}`}>Edit</Link>
                        </Button>
                        <DeleteFeatureButton id={feature.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )) : (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    <p>No features found.</p>
                    <p>Start by <Link href="/admin/features/categories/new" className="text-primary underline">creating a category</Link>, then add your first feature.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
