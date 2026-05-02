import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, User2 } from "lucide-react";

interface BlogAuthorSectionProps {
  name: string;
  image?: string | null;
  role?: string | null;
  bio?: string | null;
  credentials?: string | null;
}

export function BlogAuthorSection({
  name,
  image,
  role,
  bio,
  credentials,
}: BlogAuthorSectionProps) {
  return (
    <section className="bg-card/30 backdrop-blur-3xl border border-border/10 rounded-[3rem] p-8 md:p-12 my-24 relative overflow-hidden group">
      <div className="absolute -bottom-12 -right-12 text-primary/5 select-none pointer-events-none transition-transform group-hover:scale-110 duration-1000">
        <User2 className="h-64 w-64" />
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-8 ring-primary/5 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 duration-700">
          <AvatarImage src={image ?? ""} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-black">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-none">
              {name}
            </h3>
            {role && (
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                <Briefcase className="h-4 w-4" />
                {role}
              </div>
            )}
          </div>

          {bio && (
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
              {bio}
            </p>
          )}

          {credentials && (
            <div className="flex flex-wrap gap-3">
              {credentials.split(",").map((cred, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest"
                >
                  <Award className="h-3 w-3 mr-2" />
                  {cred.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
