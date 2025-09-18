import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
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

        try {
          // Find user in database
          const user = await (prisma as any).user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Check if user is verified
          if (!user.emailVerified) {
            throw new Error('Please verify your email before signing in.');
          }

          // For now, simplified user object without volunteer/therapist profiles
          // These can be added once database is properly configured
          return {
            id: user.id.toString(), // Convert to string for NextAuth compatibility
            name: user.name,
            email: user.email,
            image: user.image,
            isVolunteer: false, // Will be determined from database later
            isTherapist: false, // Will be determined from database later
            role: user.role || 'USER',
            volunteerId: undefined,
            licenseId: undefined
          };
        } catch (error) {
          // Use structured logging instead of console.error
          const { log } = await import('./logger');
          log.error('Authentication error during credentials login', error as Error, {
            component: 'auth',
            provider: 'credentials'
          });
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // Use JWT sessions for better compatibility until Prisma models are fixed
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow anonymous access always
      if (user.isAnonymous) {
        return true;
      }

      // For OAuth providers, create or update user profile
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await (prisma as any).user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user with OAuth profile
            await (prisma as any).user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                emailVerified: new Date(), // OAuth emails are pre-verified
                role: 'USER', // Default role, can be upgraded
                provider: account.provider.toUpperCase(),
                providerId: account.providerAccountId
              }
            });
          }
          return true;
        } catch (error) {
          // Use structured logging instead of console.error
          const { log } = await import('./logger');
          log.error('OAuth sign in error', error as Error, {
            component: 'auth',
            provider: account.provider,
            email: user.email
          });
          return false;
        }
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
      // Audit logging for security
      try {
        await (prisma as any).auditLog.create({
          data: {
            action: 'USER_SIGNIN',
            userId: user.id,
            details: {
              provider: account?.provider || 'anonymous',
              isNewUser,
              userAgent: 'NextAuth',
              timestamp: new Date().toISOString()
            },
            severity: 'INFO'
          }
        }).catch(() => {});
      } catch (error) {
        // Use structured logging instead of console.error
        const { log } = await import('./logger');
        log.error('Failed to log signin event', error as Error, {
          component: 'auth',
          event: 'signin',
          userId: user.id
        });
      }
    },
    
    async signOut({ session }) {
      // Audit logging for security
      try {
        await (prisma as any).auditLog.create({
          data: {
            action: 'USER_SIGNOUT',
            userId: session?.user?.id || 'unknown',
            details: {
              timestamp: new Date().toISOString()
            },
            severity: 'INFO'
          }
        }).catch(() => {});
      } catch (error) {
        // Use structured logging instead of console.error
        const { log } = await import('./logger');
        log.error('Failed to log signout event', error as Error, {
          component: 'auth',
          event: 'signout',
          userId: session?.user?.id || 'unknown'
        });
      }
    },
    
    async createUser({ user }) {
      // Log new user creation
      try {
        await (prisma as any).auditLog.create({
          data: {
            action: 'USER_CREATED',
            userId: user.id,
            details: {
              email: user.email,
              provider: 'oauth',
              timestamp: new Date().toISOString()
            },
            severity: 'INFO'
          }
        }).catch(() => {});
      } catch (error) {
        // Use structured logging instead of console.error
        const { log } = await import('./logger');
        log.error('Failed to log user creation', error as Error, {
          component: 'auth',
          event: 'createUser',
          userId: user.id,
          email: user.email
        });
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  debug: false, // Always disable debug for production security
};