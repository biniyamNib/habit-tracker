// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { type, email, phone } = await req.json();

    const auth = getAuth();

    if (type === 'email' && email) {
      // Send magic link (Firebase Email Link - recommended for email OTP)
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-otp?type=email`,
        handleCodeInApp: true,
      };

      const link = await auth.generateSignInWithEmailLink(email, actionCodeSettings);

      // For simplicity, we can return success (in real app, send email with the link)
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent to email',
        link // remove this in production
      });
    } 

    if (type === 'phone' && phone) {
      // For phone, Firebase handles OTP on client-side with RecaptchaVerifier
      // We just confirm the request is valid
      return NextResponse.json({ 
        success: true, 
        message: 'OTP will be sent via SMS' 
      });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}