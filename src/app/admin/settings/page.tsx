import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ContentForm } from '../content/_components/content-form';
import prisma from '@/lib/prisma';
import type { SiteContent } from '@prisma/client';
import { CacheManagement } from './_components/cache-management';

async function getSettingsContent() {
    const content = await prisma.siteContent.findMany({
        where: {
            OR: [
                { group: 'Email Settings' },
                { group: 'Globals' },
            ]
        },
        orderBy: { key: 'asc' },
    });

    const groupedContent = content.reduce((acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }
        acc[item.group].push(item);
        return acc;
      }, {} as Record<string, typeof content>);

    return groupedContent;
}


export default async function AdminSettingsPage() {
    const settingsContent = await getSettingsContent();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Tabs defaultValue="general" className="w-full">
                 <TabsList className="mb-6 grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="cache">Cache</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Site Settings</CardTitle>
                            <CardDescription>
                                These settings apply across the entire website.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ContentForm items={settingsContent['Globals'] || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="email">
                     <Card>
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>
                                Configure the sender information for outgoing emails. These are used when sending newsletters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ContentForm items={settingsContent['Email Settings'] || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="cache">
                    <CacheManagement />
                </TabsContent>
            </Tabs>
        </div>
    )
}
