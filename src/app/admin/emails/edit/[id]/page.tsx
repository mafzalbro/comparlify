import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EmailForm } from '../../_components/email-form';

async function getCampaign(id: string) {
    return prisma.emailCampaign.findUnique({
        where: { id },
    });
}

export default async function EditEmailCampaignPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const campaign = await getCampaign(id);

    if (!campaign) {
        notFound();
    }

    if (campaign.status !== 'PENDING') {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Cannot Edit Sent Campaign</h1>
                <p className="text-muted-foreground">This email campaign has already been sent or is currently sending and cannot be edited.</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Email Campaign</h1>
            <EmailForm campaign={campaign} />
        </div>
    );
}
