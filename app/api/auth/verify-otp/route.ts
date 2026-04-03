// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import prisma from '@/lib/prisma';

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
    const { otp, email, phone } = await req.json();

    const auth = getAuth();

    let decodedToken;

    if (email) {
      // For email link verification
      decodedToken = await auth.verifyIdToken(otp); // In real flow, you would verify the email link
    } else if (phone) {
      // For phone OTP verification (handled client-side usually, but we simulate here)
      decodedToken = await auth.verifyIdToken(otp);
    } else {
      return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 });
    }

    // Find or create user in Prisma
    let user = await prisma.user.findUnique({
      where: { email: decodedToken.email! },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: decodedToken.email!,
          name: decodedToken.name || null,
          image: decodedToken.picture || null,
        },
      });
    }

    // Return success with user data
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: error.message || 'Invalid OTP' }, { status: 400 });
  }
}