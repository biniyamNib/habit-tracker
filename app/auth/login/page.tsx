// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isEmailValid = email.includes('@') && email.includes('.');

  const handleGoogle = async () => {
    setLoading(true);
    try {
      window.location.href = '/api/auth/signin/google';
    } catch (err) {
      alert('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhone = () => {
    router.push('/auth/phone');
  };

  const handleContinueWithEmail = () => {
    if (!isEmailValid) return;
    router.push(`/auth/verify-otp?type=email&email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4">
            C
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to ChainTogether</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Sign in to build habits with friends
          </p>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google */}
            <Button 
              onClick={handleGoogle} 
              disabled={loading}
              className="w-full py-6 text-base flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Continue with Google'}
            </Button>

            {/* Phone */}
            <Button 
              variant="outline" 
              className="w-full py-6 text-base"
              onClick={handlePhone}
            >
              Continue with Phone
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-4 text-zinc-500">or</span>
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-6 text-base"
              />

              <Button 
                onClick={handleContinueWithEmail} 
                disabled={!isEmailValid || loading}
                className="w-full py-6 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-300"
              >
                Continue with Email
              </Button>
            </div>

            <div className="text-center text-xs text-zinc-500 mt-6">
              Don't have an account? Just sign in — we'll create one automatically.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}