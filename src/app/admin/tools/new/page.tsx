
import { ToolForm } from '../_components/tool-form';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

export default function NewToolPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New AI Tool</h1>
        <Button asChild variant="ghost">
          <Link href="/admin/tools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tools
          </Link>
        </Button>
      </div>
      <ToolForm />
    </div>
  );
}
