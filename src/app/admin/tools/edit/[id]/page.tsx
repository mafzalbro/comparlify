
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ToolForm } from '../../_components/tool-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getTool(id: string) {
  return prisma.tool.findUnique({
    where: { id },
  });
}

export default async function EditToolPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tool = await getTool(params.id);

  if (!tool) {
    notFound();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit AI Tool</h1>
        <Button asChild variant="ghost">
          <Link href="/admin/tools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tools
          </Link>
        </Button>
      </div>
      <ToolForm tool={tool} />
    </div>
  );
}
