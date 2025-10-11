import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

export default function AdminNewsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage News</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>News Articles</CardTitle>
          <CardDescription>
            Manage news articles and announcements for your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <Newspaper className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold">News Module Coming Soon</h3>
            <p className="mt-2 max-w-md">The functionality to create, edit, and delete news articles is currently under construction. Check back soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
