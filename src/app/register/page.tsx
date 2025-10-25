
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { Suspense } from 'react';
import { RegisterForm } from './_components/register-form';

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center py-16 md:py-24">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
            <KeyRound /> Sign Up
          </CardTitle>
          <CardDescription>
            Choose a provider below to sign up for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
