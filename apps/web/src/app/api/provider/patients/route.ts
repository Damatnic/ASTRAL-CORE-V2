import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Mock database for provider access
// In production, this would include proper authorization checks
// to ensure providers can only access their assigned patients
const mockPatients = [
  {
    id: 'patient-001',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: new Date('1990-05-15'),
    emergencyContact: {
      name: 'Michael Johnson',
      phone: '(555) 987-6543',
      relationship: 'Spouse'
    },
    therapist: 'Dr. Emily Chen',
    lastSession: new Date('2024-01-10'),
    nextSession: new Date('2024-01-17'),
    status: 'active',
    riskLevel: 'medium',
    consentForSharing: true,
    privacySettings: {
      shareProgress: true,
      shareCrisisAlerts: true,
      shareGoals: true,
      shareMoodData: true
    }
  },
  {
    id: 'patient-002',
    name: 'David Rodriguez',
    email: 'david.r@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: new Date('1985-11-22'),
    emergencyContact: {
      name: 'Maria Rodriguez',
      phone: '(555) 876-5432',
      relationship: 'Sister'
    },
    therapist: 'Dr. Emily Chen',
    lastSession: new Date('2024-01-08'),
    nextSession: new Date('2024-01-15'),
    status: 'active',
    riskLevel: 'high',
    consentForSharing: true,
    privacySettings: {
      shareProgress: true,
      shareCrisisAlerts: true,
      shareGoals: false,
      shareMoodData: true
    }
  },
  {
    id: 'patient-003',
    name: 'Ashley Kim',
    email: 'ashley.k@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: new Date('1992-08-03'),
    emergencyContact: {
      name: 'James Kim',
      phone: '(555) 765-4321',
      relationship: 'Father'
    },
    therapist: 'Dr. Emily Chen',
    lastSession: new Date('2024-01-12'),
    nextSession: new Date('2024-01-19'),
    status: 'active',
    riskLevel: 'low',
    consentForSharing: true,
    privacySettings: {
      shareProgress: true,
      shareCrisisAlerts: true,
      shareGoals: true,
      shareMoodData: false
    }
  },
  {
    id: 'patient-004',
    name: 'Marcus Thompson',
    email: 'marcus.t@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: new Date('1988-02-14'),
    emergencyContact: {
      name: 'Lisa Thompson',
      phone: '(555) 654-3210',
      relationship: 'Wife'
    },
    therapist: 'Dr. Emily Chen',
    lastSession: new Date('2023-12-20'),
    status: 'crisis',
    riskLevel: 'critical',
    consentForSharing: true,
    privacySettings: {
      shareProgress: true,
      shareCrisisAlerts: true,
      shareGoals: true,
      shareMoodData: true
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // In production, verify provider credentials and access permissions
    // For demo purposes, we'll check if the user has provider role
    const userEmail = session.user.email
    const isProvider = userEmail.includes('provider') || userEmail.includes('therapist') || userEmail.includes('doctor')

    if (!isProvider) {
      return NextResponse.json(
        { error: 'Provider access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const riskLevel = searchParams.get('riskLevel')
    const status = searchParams.get('status')

    let filteredPatients = mockPatients

    // Apply filters
    if (riskLevel) {
      filteredPatients = filteredPatients.filter(patient => patient.riskLevel === riskLevel)
    }
    if (status) {
      filteredPatients = filteredPatients.filter(patient => patient.status === status)
    }

    // Remove sensitive information based on consent
    const sanitizedPatients = filteredPatients.map(patient => {
      if (!patient.consentForSharing) {
        return {
          id: patient.id,
          name: patient.name,
          status: patient.status,
          riskLevel: patient.riskLevel,
          lastSession: patient.lastSession,
          consentForSharing: false,
          limitedAccess: true
        }
      }
      return patient
    })

    return NextResponse.json({
      success: true,
      patients: sanitizedPatients,
      total: sanitizedPatients.length,
      filters: { riskLevel, status }
    })

  } catch (error) {
    console.error('Error in provider patients GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // In production, this would be used to add new patients to provider's caseload
    // or update patient assignments
    
    return NextResponse.json(
      { error: 'Patient management not implemented in demo' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error in provider patients POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}