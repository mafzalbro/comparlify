
import prisma from "@/lib/prisma";
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
import { ContentForm } from "./_components/content-form";

async function getSiteContent() {
  const content = await prisma.siteContent.findMany({
    orderBy: {
      group: 'asc',
    },
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

export default async function AdminContentPage() {
  const groupedContent = await getSiteContent();
  const groups = Object.keys(groupedContent);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Site Content Management</h1>
        <p className="text-muted-foreground">
          Update the text and content across your website's main pages.
        </p>
      </div>

      <Tabs defaultValue={groups[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-6 h-auto mb-6">
            {groups.map(group => (
                <TabsTrigger key={group} value={group}>{group}</TabsTrigger>
            ))}
        </TabsList>
        {groups.map(group => (
            <TabsContent key={group} value={group}>
                 <Card>
                    <CardHeader>
                        <CardTitle>{group} Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ContentForm items={groupedContent[group]} />
                    </CardContent>
                </Card>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
