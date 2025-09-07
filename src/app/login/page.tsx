'use client';

import React from 'react';
import { loginUser } from '@/app/actions';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  const initialState = { error: null, success: false };
  const [state, formAction] = React.useActionState(loginUser, initialState);

  return (
    <div className="container py-16 md:py-24 px-4 md:px-6">
      <AuthForm
        title="Welcome Back"
        description="Log in to access your account and resources."
        action={formAction}
        state={state}
        buttonLabel="Log In"
        footerText="Don't have an account?"
        footerLink="/register"
        footerLinkText="Sign Up"
      />
    </div>
  );
}
