// app/auth/verify-otp/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const type = searchParams.get('type') as 'email' | 'phone';
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyOTP = async () => {
    if (otp.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          otp, 
          email: type === 'email' ? email : undefined, 
          phone: type === 'phone' ? phone : undefined 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-zinc-700"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <p className="text-sm text-zinc-500 mt-1">
              We sent a 6-digit code to {type === 'email' ? email : phone}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                className="text-center text-3xl tracking-[8px] py-8"
              />
            </div>

            <Button 
              onClick={verifyOTP} 
              className="w-full py-7 bg-teal-600 hover:bg-teal-700 text-lg"
              disabled={loading || otp.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}

            <p className="text-center text-xs text-zinc-500">
              Didn't receive the code? <button className="text-teal-600 hover:underline" onClick={() => router.back()}>Resend</button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}