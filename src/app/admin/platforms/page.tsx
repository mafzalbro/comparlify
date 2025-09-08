
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { DeletePlatformButton } from './_components/delete-platform-button';
import { ManagedImage } from '@/components/managed-image';


async function getPlatforms() {
  const platforms = await prisma.platform.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  return platforms;
}

export default async function AdminPlatformsPage() {
  const platforms = await getPlatforms();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Platforms</h1>
        <Button asChild>
          <Link href="/admin/platforms/new">Create New Platform</Link>
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platforms.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                         <ManagedImage src={platform.logoUrl} alt={platform.name} width={80} height={20} className="object-contain" />
                        <Link href={`/admin/platforms/edit/${platform.id}`} className="hover:underline font-semibold">{platform.name}</Link>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        {platform.rating?.toFixed(1) ?? 'N/A'}
                    </div>
                </TableCell>
                <TableCell>
                    <a href={platform.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary text-sm">
                        {platform.website}
                    </a>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/platforms/edit/${platform.id}`}>Edit</Link>
                  </Button>
                  <DeletePlatformButton id={platform.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
