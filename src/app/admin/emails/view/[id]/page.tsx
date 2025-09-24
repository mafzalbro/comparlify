import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipientStatusTable } from '../../_components/recipient-status-table';
import { MarkdownContent } from '@/components/markdown-content';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RetryFailedButton } from '../../_components/retry-failed-button';

async function getCampaignDetails(id: string) {
    return prisma.emailCampaign.findUnique({
        where: { id },
        include: {
            recipients: {
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            }
        }
    });
}

export default async function ViewEmailCampaignPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const campaign = await getCampaignDetails(id);

    if (!campaign) {
        notFound();
    }

    const hasFailedRecipients = campaign.recipients.some(r => r.status === 'FAILED');

    return (
        <div>
            <div className="mb-6">
                <Button asChild variant="ghost">
                    <Link href="/admin/emails">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Campaigns
                    </Link>
                </Button>
            </div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{campaign.subject}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge>{campaign.status}</Badge>
                        <p className="text-sm text-muted-foreground">
                            {campaign.sentAt ? `Sent on ${format(new Date(campaign.sentAt), 'PPP p')}` : `Created on ${format(new Date(campaign.createdAt), 'PPP p')}`}
                        </p>
                    </div>
                </div>
                {hasFailedRecipients && <RetryFailedButton campaignId={campaign.id} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none border rounded-lg p-4 bg-muted/50">
                                <MarkdownContent content={campaign.content} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Recipients ({campaign.recipients.length})</CardTitle>
                             <CardDescription>Status of email delivery to each subscribed user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecipientStatusTable recipients={campaign.recipients} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
