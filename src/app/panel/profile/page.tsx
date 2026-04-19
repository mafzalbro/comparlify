import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumb";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="container mx-auto py-16 md:py-24">
      <Breadcrumbs
        items={[{ name: "Home", href: "/" }, { name: "Profile" }]}
        className="mb-8"
      />
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-headline">
                {user.name}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">User Information</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p className="flex items-center gap-2">
              <strong>Role:</strong>{" "}
              <Badge
                variant={user.role === "ADMIN" ? "destructive" : "secondary"}
              >
                {user.role}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
