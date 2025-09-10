
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ContactsDataTable } from './_components/data-table';
import prisma from '@/lib/prisma';
import { columns } from './_components/columns';

async function getContactMessages() {
    return prisma.contactMessage.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export default async function AdminContactsPage() {
    const messages = await getContactMessages();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Contact Messages</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Messages submitted through the site's contact form.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContactsDataTable columns={columns} data={messages} />
                </CardContent>
            </Card>
        </div>
    );
}
