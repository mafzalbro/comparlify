
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Site Content Management</h1>
        <p className="text-muted-foreground">
          Update the text and content across your website's main pages.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedContent).map(([group, items]) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{group}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentForm items={items} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
