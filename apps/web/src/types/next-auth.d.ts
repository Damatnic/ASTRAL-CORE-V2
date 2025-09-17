import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAnonymous: boolean;
      isVolunteer: boolean;
      isTherapist: boolean;
      role: string;
      volunteerId?: string;
      licenseId?: string;
      sessionToken?: string;
      emailVerified?: Date | null;
      provider?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAnonymous?: boolean;
    isVolunteer?: boolean;
    isTherapist?: boolean;
    role?: string;
    volunteerId?: string;
    licenseId?: string;
    sessionToken?: string;
    emailVerified?: Date | null;
    provider?: string;
    password?: string;
  }

  interface Profile {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    email_verified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAnonymous?: boolean;
    isVolunteer?: boolean;
    isTherapist?: boolean;
    role?: string;
    volunteerId?: string;
    licenseId?: string;
    sessionToken?: string;
    emailVerified?: Date | null;
    provider?: string;
  }
}