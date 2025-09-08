
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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DeleteFeatureButton } from './_components/delete-feature-button';

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

  const groupedFeatures = features.reduce((acc, feature) => {
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
        <Button asChild>
          <Link href="/admin/features/new">Create New Feature</Link>
        </Button>
      </div>

      <div className="space-y-8">
        {categories.map(category => (
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
                  {groupedFeatures[category].map((feature) => (
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
        ))}
      </div>
    </div>
  );
}
