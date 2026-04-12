
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
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { DeleteLegalDocumentButton } from './_components/delete-document-button';

async function getDocuments() {
  const documents = await prisma.siteContent.findMany({
    where: { group: 'Legal Pages' },
    orderBy: {
      key: 'asc',
    },
  });
  return documents;
}

export default async function AdminLegalPage() {
  const documents = await getDocuments();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Legal Documents</h1>
        <Button asChild>
          <Link href="/admin/legal/new"><PlusCircle className="mr-2 h-4 w-4"/>Create New Document</Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {documents.map((doc) => {
                    const title = doc.key.replace('legal.', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const slug = doc.key.replace('legal.', '');
                    return (
                        <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                                <Link href={`/admin/legal/edit/${doc.id}`} className="hover:underline">{title}</Link>
                            </TableCell>
                            <TableCell>
                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">{slug}</span>
                            </TableCell>
                            <TableCell>
                                {format(new Date(doc.updatedAt), 'P')}
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/admin/legal/edit/${doc.id}`}>Edit</Link>
                            </Button>
                            <DeleteLegalDocumentButton id={doc.id} />
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
