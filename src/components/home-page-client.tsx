
'use client';

import type { Session } from 'next-auth';
import { WelcomeOnboarding } from '@/components/welcome-onboarding';

interface HomePageClientProps {
  session: Session | null;
}

export function HomePageClient({ session }: HomePageClientProps) {
  const showOnboarding = session?.user && !session.user.onboarded;

  if (!showOnboarding) {
    return null;
  }

  return <WelcomeOnboarding user={session.user} />;
}
