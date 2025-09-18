import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export const authOptions: NextAuthOptions = {
  // Temporarily disable Prisma adapter for Vercel deployment
  // adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      id: 'anonymous',
      name: 'Anonymous Access',
      credentials: {
        type: { label: 'Type', type: 'text' }
      },
      async authorize(credentials) {
        // Anonymous user access - create temporary session
        const anonymousId = randomBytes(16).toString('hex');
        
        return {
          id: anonymousId,
          name: 'Anonymous User',
          email: null,
          image: null,
          isAnonymous: true,
          sessionToken: randomBytes(32).toString('hex')
        };
      }
    }),
    CredentialsProvider({
      id: 'volunteer',
      name: 'Volunteer Login',
      credentials: {
        id: { label: 'Volunteer ID', type: 'text' },
        passcode: { label: 'Passcode', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.passcode) {
          return null;
        }

        // In a real implementation, you would verify the volunteer credentials
        // For demo purposes, we'll accept any ID with passcode 'volunteer123'
        if (credentials.passcode === 'volunteer123') {
          return {
            id: credentials.id,
            name: `Volunteer ${credentials.id}`,
            email: `volunteer${credentials.id}@astralcore.demo`,
            image: null,
            isVolunteer: true,
            volunteerId: credentials.id
          };
        }

        return null;
      }
    }),
    CredentialsProvider({
      id: 'therapist',
      name: 'Therapist Portal',
      credentials: {
        licenseId: { label: 'License ID', type: 'text' },
        passcode: { label: 'Passcode', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.licenseId || !credentials?.passcode) {
          return null;
        }

        // Demo therapist login - passcode 'therapist123'
        if (credentials.passcode === 'therapist123') {
          return {
            id: credentials.licenseId,
            name: `Dr. ${credentials.licenseId}`,
            email: `therapist${credentials.licenseId}@astralcore.demo`,
            image: null,
            isTherapist: true,
            licenseId: credentials.licenseId
          };
        }

        return null;
      }
    }),
    
    // OAuth Providers for Volunteers and Therapists
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Email/Password Provider for Volunteers and Therapists
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Database authentication disabled for Vercel deployment
        // For demo purposes, use simplified credentials
        if (credentials.email === 'demo@astralcore.app' && credentials.password === 'demo123') {
          return {
            id: 'demo-user',
            name: 'Demo User',
            email: credentials.email,
            image: null,
            isVolunteer: false,
            isTherapist: false,
            role: 'USER',
            volunteerId: undefined,
            licenseId: undefined
          };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt', // Use JWT sessions for Vercel Edge compatibility
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow anonymous access always
      if (user.isAnonymous) {
        return true;
      }

      // For OAuth providers, allow sign in (database operations disabled for Vercel deployment)
      if (account?.provider === 'google' || account?.provider === 'github') {
        return true;
      }

      return true;
    },

    async jwt({ token, user }) {
      // If this is the initial sign in, save the user info to the token
      if (user) {
        token.id = user.id;
        token.isAnonymous = user.isAnonymous || false;
        token.isVolunteer = user.isVolunteer || false;
        token.isTherapist = user.isTherapist || false;
        token.role = user.role || 'USER';
        token.volunteerId = user.volunteerId;
        token.licenseId = user.licenseId;
      }
      return token;
    },

    async session({ session, token }) {
      // Include the user ID and other properties in the session
      if (token) {
        session.user.id = token.id as string;
        session.user.isAnonymous = token.isAnonymous as boolean;
        session.user.isVolunteer = token.isVolunteer as boolean;
        session.user.isTherapist = token.isTherapist as boolean;
        session.user.role = token.role as string;
        session.user.volunteerId = token.volunteerId as string;
        session.user.licenseId = token.licenseId as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Ensure redirects stay within our domain
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    // signUp is handled by custom page, not a NextAuth page
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Audit logging disabled for Vercel deployment - will be re-enabled with proper database
      console.log('User signed in:', user.id, account?.provider || 'anonymous');
    },
    
    async signOut({ session }) {
      // Audit logging disabled for Vercel deployment
      console.log('User signed out:', session?.user?.id || 'unknown');
    },
    
    async createUser({ user }) {
      // Audit logging disabled for Vercel deployment
      console.log('User created:', user.id, user.email);
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  debug: false, // Always disable debug for production security
};