
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UserPanelDashboard() {
    const session = await auth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
                <p className="text-muted-foreground">This is your personal dashboard. More features coming soon!</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Navigate to other parts of the application.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button asChild>
                        <Link href="/profile">View My Profile</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/tools">Explore AI Tools</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
