import { NextAuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import CredentialsProvider from 'next-auth/providers/credentials';
import { randomBytes } from 'crypto';

// Simple Auth0 configuration for Astral Core mental health platform
export const authOptions: NextAuthOptions = {
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    // Auth0 Provider - primary authentication
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER_BASE_URL!,
    }),
    
    // Anonymous access for crisis situations
    CredentialsProvider({
      id: 'anonymous',
      name: 'Anonymous Crisis Access',
      credentials: {
        type: { label: 'Access Type', type: 'text', value: 'crisis' }
      },
      async authorize(credentials) {
        // Always allow anonymous access for mental health emergencies
        const anonymousId = randomBytes(16).toString('hex');
        
        return {
          id: anonymousId,
          name: 'Anonymous User',
          email: null,
          image: null,
          isAnonymous: true,
          accessType: 'crisis'
        };
      }
    }),
  ],
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.isAnonymous = (user as any).isAnonymous || false;
        token.accessType = (user as any).accessType || 'authenticated';
      }
      return token;
    },
    
    async session({ session, token }) {
      (session.user as any).isAnonymous = token.isAnonymous || false;
      (session.user as any).accessType = token.accessType || 'authenticated';
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET!,
};