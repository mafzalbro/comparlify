
'use server';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { type Tool } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { iconMap } from '@/app/(main)/tools/tools';
import { DeleteToolButton } from './_components/delete-tool-button';
import { EnableToolSwitch } from './_components/enable-tool-switch';

async function getTools(): Promise<Tool[]> {
  return prisma.tool.findMany({
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });
}

export default async function AdminToolsPage() {
  const tools = await getTools();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage AI Tools</h1>
        <Button asChild>
          <Link href="/admin/tools/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Tool
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Tool Library</CardTitle>
          <CardDescription>
            Manage the AI-powered tools available to users. You can enable, disable, or edit each tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => {
                const Icon = iconMap[tool.Icon] || iconMap['Wand2'];
                return (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <Link href={`/admin/tools/edit/${tool.id}`} className="hover:underline">
                                {tool.title}
                            </Link>
                        </div>
                    </TableCell>
                    <TableCell>{tool.category}</TableCell>
                    <TableCell>
                      <EnableToolSwitch toolId={tool.id} isEnabled={tool.enabled} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/tools/edit/${tool.id}`}>Edit</Link>
                      </Button>
                      <DeleteToolButton id={tool.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {tools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No tools found.
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
