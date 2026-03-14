// app/api/auth/[...nextauth]/route.ts

export const runtime = 'nodejs';  // ← Keep this to avoid crypto/edge issues

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;