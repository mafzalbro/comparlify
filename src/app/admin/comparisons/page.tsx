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
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { DeleteComparisonButton } from './_components/delete-comparison-button';

async function getComparisons() {
  const comparisons = await prisma.comparison.findMany({
    include: {
      platformA: true,
      platformB: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return comparisons;
}

export default async function AdminComparisonsPage() {
  const comparisons = await getComparisons();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Comparisons</h1>
        <Button asChild>
          <Link href="/admin/comparisons/new">Create New Comparison</Link>
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisons.map((comp) => (
              <TableRow key={comp.id}>
                <TableCell className="font-medium">
                    <Link href={`/admin/comparisons/edit/${comp.id}`} className="hover:underline">{comp.title}</Link>
                </TableCell>
                 <TableCell>{comp.platformA.name} vs {comp.platformB.name}</TableCell>
                <TableCell>
                  <Badge variant={comp.published ? 'default' : 'secondary'}>
                    {comp.published ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                    {comp.published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(comp.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/comparisons/edit/${comp.id}`}>Edit</Link>
                  </Button>
                  <DeleteComparisonButton id={comp.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
