import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAnonymous?: boolean
      isVolunteer?: boolean
      isTherapist?: boolean
      role?: string
      volunteerId?: string
      licenseId?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    isAnonymous?: boolean
    isVolunteer?: boolean
    isTherapist?: boolean
    role?: string
    volunteerId?: string
    licenseId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAnonymous?: boolean
    isVolunteer?: boolean
    isTherapist?: boolean
    role?: string
    volunteerId?: string
    licenseId?: string
  }
}