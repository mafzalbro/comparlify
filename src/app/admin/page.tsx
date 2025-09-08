import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare, Table, Users, MessageCircle } from "lucide-react";
import prisma from "@/lib/prisma";

async function getDashboardStats() {
    const [platformCount, featureCount, userCount, commentCount] = await prisma.$transaction([
        prisma.platform.count(),
        prisma.feature.count(),
        prisma.user.count(),
        prisma.comment.count({ where: { status: 'PENDING' }})
    ]);
    return { platformCount, featureCount, userCount, commentCount };
}

export default async function AdminDashboardPage() {
    const { platformCount, featureCount, userCount, commentCount } = await getDashboardStats();

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Platforms
                        </CardTitle>
                        <Table className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{platformCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently being compared
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Features
                        </CardTitle>
                        <PenSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{featureCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Tracked across all platforms
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered in the system
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Comments
                        </CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{commentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting moderation
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to your Dashboard!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is your central hub for managing the content on Comparlify. From here, you can add, edit, and remove platforms and features for comparison.</p>
                        <p className="mt-4">Use the navigation on the left to get started.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
