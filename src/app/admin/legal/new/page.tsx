
import { LegalDocumentForm } from '../_components/legal-document-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewLegalDocumentPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Legal Document</h1>
         <Button asChild variant="ghost">
            <Link href="/admin/legal"><ArrowLeft className="mr-2 h-4 w-4" />Back to Documents</Link>
        </Button>
      </div>
      <LegalDocumentForm />
    </div>
  );
}
