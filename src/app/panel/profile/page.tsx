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
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[{ name: "Home", href: "/" }, { name: "Profile" }]}
        className="mb-4"
      />
      <Card className="max-w-2xl mx-auto bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md rounded-2xl">
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="text-xl font-extrabold">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-extrabold">
                {user.name}
              </CardTitle>
              <CardDescription className="text-xs font-medium">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">User Information</h3>
          <div className="text-xs text-muted-foreground space-y-2 font-medium">
            <p>
              <strong className="text-foreground">ID:</strong> {user.id}
            </p>
            <p className="flex items-center gap-2">
              <strong className="text-foreground">Role:</strong>{" "}
              <Badge
                variant={user.role === "ADMIN" ? "destructive" : "secondary"}
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5"
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
