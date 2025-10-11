
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EmailForm } from '../../_components/email-form';
import type { User } from '@prisma/client';

async function getCampaign(id: string) {
    return prisma.emailCampaign.findUnique({
        where: { id },
    });
}

async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { name: 'asc' }});
}

export default async function EditEmailCampaignPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const [campaign, users] = await Promise.all([
      getCampaign(id),
      getUsers()
    ]);

    if (!campaign) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Email Campaign</h1>
            <EmailForm campaign={campaign} users={users} />
        </div>
    );
}
