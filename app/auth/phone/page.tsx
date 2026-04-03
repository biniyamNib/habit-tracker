// app/auth/phone/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function PhonePage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const sendPhoneOTP = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'phone', phone }),
      });

      if (res.ok) {
        // Go directly to OTP verification page with phone
        router.push(`/auth/verify-otp?type=phone&phone=${encodeURIComponent(phone)}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button 
          onClick={() => router.push('/auth/login')}
          className="flex items-center gap-2 text-zinc-500 mb-8 hover:text-zinc-700"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Enter your phone number</CardTitle>
            <p className="text-sm text-zinc-500 mt-2">
              We'll send you a verification code via SMS
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="py-6 text-base"
              />
            </div>

            <Button 
              onClick={sendPhoneOTP} 
              className="w-full py-6 bg-teal-600 hover:bg-teal-700"
              disabled={loading || !phone}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending verification code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}