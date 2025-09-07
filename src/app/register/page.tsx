'use client';

import { useActionState } from 'react';
import { registerUser } from '@/app/actions';
import { AuthForm } from '@/components/auth/auth-form';

export default function RegisterPage() {
  const initialState = { error: null, success: false };
  const [state, formAction] = useActionState(registerUser, initialState);

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <AuthForm
        title="Create an Account"
        description="Sign up to get started with Comparlify."
        action={formAction}
        state={state}
        buttonLabel="Create Account"
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Log In"
      />
    </div>
  );
}
