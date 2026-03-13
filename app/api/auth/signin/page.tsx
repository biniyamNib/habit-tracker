'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Welcome back</h2>
        <Button
          onClick={() => signIn('google')}
          className="w-full mb-4"
          size="lg"
        >
          Continue with Google
        </Button>
        <Button
          onClick={() => signIn('credentials', { email: 'demo@chain.com' })}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Use Demo Account
        </Button>
      </div>
    </div>
  );
}