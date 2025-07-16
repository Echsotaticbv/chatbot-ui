import NextAuth, { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import jwt from 'jsonwebtoken';
import {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_JWT_SECRET,
  SUPABASE_SERVICE_ROLE_KEY,
} from '@/utils/app/auth/constants';
import { getProviders } from '@/utils/app/auth/providers';

const providers = getProviders();

export const authOptions: NextAuthOptions = {
  providers,
  secret: 'f92a47deeef45c43eb68037351f92bd5', // Your secret directly added
  session: { strategy: 'jwt' },
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
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true // Required for HTTPS
      }
    }
  }
};

export default NextAuth(authOptions);
