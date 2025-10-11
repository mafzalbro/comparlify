import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DeleteCampaignButton } from './_components/delete-campaign-button';
import { CloneCampaignButton } from './_components/clone-campaign-button';

async function getCampaigns() {
    return prisma.emailCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { recipients: true }
            }
        }
    });
}

export default async function AdminEmailsPage() {
    const campaigns = await getCampaigns();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Email Campaigns</h1>
                <Button asChild>
                    <Link href="/admin/emails/new"><PlusCircle className="mr-2 h-4 w-4" />New Campaign</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Campaigns</CardTitle>
                    <CardDescription>Manage your email newsletters to subscribed users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Recipients</TableHead>
                                <TableHead>Sent At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map(campaign => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/emails/view/${campaign.id}`} className="hover:underline">
                                            {campaign.subject}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={campaign.status === 'SENT' ? 'default' : 'secondary'}>
                                            {campaign.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{campaign.status === 'SENT' ? campaign._count.recipients : '-'}</TableCell>
                                    <TableCell>{campaign.sentAt ? format(campaign.sentAt, 'PP p') : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/admin/emails/view/${campaign.id}`}>View</Link>
                                        </Button>
                                        {campaign.status === 'PENDING' && (
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/admin/emails/edit/${campaign.id}`}>Edit</Link>
                                            </Button>
                                        )}
                                        <CloneCampaignButton campaignId={campaign.id} size="sm" />
                                        <DeleteCampaignButton id={campaign.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {campaigns.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        You haven't created any campaigns yet.
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
