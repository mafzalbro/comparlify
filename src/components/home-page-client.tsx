"use client";

import { useSession } from "next-auth/react";
import { WelcomeOnboarding } from "@/components/welcome-onboarding";

export function HomePageClient() {
  const { data: session } = useSession();
  const showOnboarding = session?.user && !(session.user as any).onboarded;

  if (!showOnboarding) {
    return null;
  }

  return <WelcomeOnboarding user={session.user} />;
}
