
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { TempDirectLogin } from './_components/temp-direct-login';
import { Suspense } from 'react';
import { LoginForm } from './_components/login-form';

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center py-16 md:py-24">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
            <KeyRound /> Welcome Back
          </CardTitle>
          <CardDescription>
            Choose a provider below to sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
          {process.env.NODE_ENV === 'development' && <TempDirectLogin />}
        </CardContent>
      </Card>
    </div>
  );
}
