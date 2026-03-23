'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Sign In</h2>

        <Button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full mb-4"
          variant="outline"
        >
          Continue with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* For full email/password form – you can expand later or keep minimal */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            await signIn('credentials', {
              email: form.get('email') as string,
              password: form.get('password') as string,
              callbackUrl: '/dashboard',
            });
          }}
          className="space-y-4"
        >
          <input name="email" type="email" placeholder="Email" required className="w-full p-3 border rounded" />
          <input name="password" type="password" placeholder="Password" required className="w-full p-3 border rounded" />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}