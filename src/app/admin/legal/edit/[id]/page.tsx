
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LegalDocumentForm } from '../../_components/legal-document-form';
import type { LegalDocument } from '@prisma/client';

async function getDocument(id: string): Promise<LegalDocument | null> {
    return prisma.legalDocument.findUnique({
        where: { id },
    });
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
            <h1 className="text-3xl font-bold mb-6">Edit Legal Document</h1>
            <LegalDocumentForm document={document} />
        </div>
    );
}
