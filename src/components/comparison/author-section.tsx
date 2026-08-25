import React from 'react';
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck } from "lucide-react";

interface AuthorSectionProps {
  name: string;
  role: string;
  bio: string;
  credentials: string[];
}

export function AuthorSection({ name, role, bio, credentials }: AuthorSectionProps) {
  return (
    <div className="my-10 p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShieldCheck className="w-20 h-20 text-primary" />
      </div>

      <div className="relative flex flex-col md:flex-row gap-6 items-start">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
          <User className="w-7 h-7 text-primary" />
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-foreground">{name}</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px]">
                Industrial Analyst
              </Badge>
            </div>
            <p className="text-xs text-primary font-medium">{role}</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl italic">
            "{bio}"
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {credentials.map((cred, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-background border border-border/30 rounded-full text-[10px] font-semibold text-muted-foreground shadow-xs">
                {cred}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
        <span>Lead Industrial Verification</span>
        <span className="flex items-center gap-1.5 text-emerald-500">
          <ShieldCheck className="w-3 h-3" />
          Verified Assessment
        </span>
      </div>
    </div>
  );
}
