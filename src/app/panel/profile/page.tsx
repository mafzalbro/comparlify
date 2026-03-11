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
import { MotionDiv } from "@/components/motion-wrapper";
import { UserCircle, Shield, Fingerprint, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="space-y-4 px-4">
        <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
          Identity <span className="text-primary italic">Node</span>
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your global signaling parameters and verified credentials.
        </p>
      </header>

      <MotionDiv
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden bg-card/40 backdrop-blur-3xl border-primary/20 shadow-2xl rounded-[3rem]">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 p-12 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
            <UserCircle className="h-64 w-64" />
          </div>

          <CardHeader className="p-12 pb-8 border-b border-border/10 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-primary/40 to-secondary/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Avatar className="h-32 w-32 border-4 border-card ring-4 ring-primary/20 shadow-2xl relative z-10">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                  <AvatarFallback className="text-4xl font-black bg-secondary text-secondary-foreground">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center md:text-left space-y-3 pb-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Badge
                    variant="outline"
                    className="px-4 py-1 border-primary/20 text-primary bg-primary/5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full"
                  >
                    {user.role === "ADMIN" ? (
                      <Shield className="h-3 w-3 mr-2" />
                    ) : (
                      <UserCircle className="h-3 w-3 mr-2" />
                    )}
                    {user.role} Verified
                  </Badge>
                </div>
                <CardTitle className="text-4xl md:text-6xl font-black tracking-tight leading-none italic">
                  {user.name}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12 space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-8 rounded-[2rem] bg-secondary/5 border border-border/10">
                <div className="flex items-center gap-3 text-primary">
                  <Mail className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Contact Vector
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">
                    {user.email}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose opacity-50">
                    Private Communication Channel
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-8 rounded-[2rem] bg-secondary/5 border border-border/10">
                <div className="flex items-center gap-3 text-primary">
                  <Fingerprint className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Terminal ID
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-mono font-bold text-foreground break-all">
                    {user.id}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose opacity-50">
                    Unique Neural Address
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
