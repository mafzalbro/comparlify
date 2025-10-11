import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function AdminCommunityPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Community</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Forums</CardTitle>
          <CardDescription>
            Manage forum categories, topics, and replies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold">Community Module Coming Soon</h3>
            <p className="mt-2 max-w-md">The functionality to manage your community forums is currently under construction. Check back soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
