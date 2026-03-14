'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleDemo = async () => {
    setLoading(true);
    setErrorMsg(null);

    const result = await signIn('credentials', {
      email: 'demo@biniyam.dev',     // can be any string
      redirect: false,                // ← key: stay on page to see result
    });

    if (result?.error) {
      // This catches "CredentialsSignin" → shows friendly message
      setErrorMsg(
        result.error === 'CredentialsSignin'
          ? 'Login failed – check server logs or config'
          : result.error
      );
    } else if (result?.ok) {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-8">ChainTogether Demo</h2>

        <Button
          onClick={handleDemo}
          className="w-full mb-6"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Use Demo Account'}
        </Button>

        {errorMsg && (
          <p className="text-red-600 mt-4">{errorMsg}</p>
        )}

        <p className="text-sm text-gray-500 mt-6">
          (No password needed – instant demo access)
        </p>
      </div>
    </div>
  );
}