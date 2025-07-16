import NextAuth, { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import jwt from 'jsonwebtoken';
import {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_JWT_SECRET,
  SUPABASE_SERVICE_ROLE_KEY,
} from '@/utils/app/auth/constants';
import { getProviders } from '@/utils/app/auth/providers';

// Pre-fetch providers to avoid async issues
const providers = await getProviders();

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: 'jwt' },
  trustHost: true, // Critical for Render/HTTPS
  adapter: SUPABASE_JWT_SECRET && SUPABASE_SERVICE_ROLE_KEY
    ? SupabaseAdapter({
        url: NEXT_PUBLIC_SUPABASE_URL,
        secret: SUPABASE_SERVICE_ROLE_KEY,
      })
    : undefined,
  callbacks: {
    async session({ session, token }) {
      if (!SUPABASE_JWT_SECRET) return session;
      const payload = {
        aud: 'authenticated',
        exp: Math.floor(new Date(session.expires).getTime() / 1000),
        sub: token.sub,
        email: token.email,
        role: 'authenticated',
      };
      session.customAccessToken = jwt.sign(payload, SUPABASE_JWT_SECRET);
      return session;
    },
  },
};

export default NextAuth(authOptions);
