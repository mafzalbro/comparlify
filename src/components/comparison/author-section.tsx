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
    <div className="my-16 p-8 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShieldCheck className="w-24 h-24 text-slate-900" />
      </div>

      <div className="relative flex flex-col md:flex-row gap-8 items-start">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-xl shadow-blue-200">
          <User className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
                Industrial Analyst
              </Badge>
            </div>
            <p className="text-blue-600 font-medium">{role}</p>
          </div>

          <p className="text-slate-600 leading-relaxed max-w-3xl italic">
            "{bio}"
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {credentials.map((cred, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-500 shadow-sm">
                {cred}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-400">
        <span>Lead Industrial Verification</span>
        <span className="flex items-center gap-2 text-green-600">
          <ShieldCheck className="w-3 h-3" />
          Verified Assessment
        </span>
      </div>
    </div>
  );
}
