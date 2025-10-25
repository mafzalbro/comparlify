
import { EmailForm } from '../_components/email-form';
import prisma from '@/lib/prisma';
import type { User } from '@prisma/client';

async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({ 
      where: { email: { not: null }},
      orderBy: { name: 'asc' }
    });
}

export default async function NewEmailCampaignPage() {
  const users = await getUsers();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Compose New Email Campaign</h1>
      <EmailForm users={users} />
    </div>
  );
}
