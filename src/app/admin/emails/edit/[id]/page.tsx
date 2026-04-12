
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EmailForm } from '../../_components/email-form';
import type { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

async function getCampaign(id: string) {
    return prisma.emailCampaign.findUnique({
        where: { id },
    });
}

async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({ 
      where: { email: { not: null }},
      orderBy: { name: 'asc' }
    });
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit Email Campaign</h1>
                <Button asChild variant="ghost">
                    <Link href="/admin/emails"><ArrowLeft className="mr-2 h-4 w-4" />Back to Campaigns</Link>
                </Button>
            </div>
            <EmailForm campaign={campaign} users={users} />
        </div>
    );
}
