
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LegalDocumentForm } from '../../_components/legal-document-form';
import type { SiteContent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getDocument(id: string): Promise<SiteContent | null> {
    const doc = await prisma.siteContent.findUnique({
        where: { id, group: 'Legal Pages' },
    });
    if (!doc) return null;
    return doc;
}

export default async function EditLegalDocumentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const document = await getDocument(id);

    if (!document) {
        notFound();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit Legal Document</h1>
                <Button asChild variant="ghost">
                    <Link href="/admin/legal"><ArrowLeft className="mr-2 h-4 w-4" />Back to Documents</Link>
                </Button>
            </div>
            <LegalDocumentForm document={document} />
        </div>
    );
}
