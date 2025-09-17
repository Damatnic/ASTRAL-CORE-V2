import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Mock crisis alerts database
const mockAlerts = [
  {
    id: 'alert-001',
    patientId: 'patient-004',
    patientName: 'Marcus Thompson',
    severity: 'critical' as const,
    type: 'crisis-contact' as const,
    triggeredAt: new Date('2024-01-15T14:30:00Z'),
    description: 'Patient contacted crisis hotline at 2:30 PM. High suicide risk indicators detected.',
    actionTaken: false,
    notes: 'Immediate intervention required. Patient expressing active suicidal ideation.'
  },
  {
    id: 'alert-002',
    patientId: 'patient-002',
    patientName: 'David Rodriguez',
    severity: 'high' as const,
    type: 'mood-decline' as const,
    triggeredAt: new Date('2024-01-15T10:15:00Z'),
    description: 'Mood tracking shows consistent decline over 5 days. Average mood dropped from 6 to 3.',
    actionTaken: false,
    notes: 'Pattern suggests possible depressive episode. Consider medication review.'
  },
  {
    id: 'alert-003',
    patientId: 'patient-001',
    patientName: 'Sarah Johnson',
    severity: 'medium' as const,
    type: 'missed-sessions' as const,
    triggeredAt: new Date('2024-01-14T16:00:00Z'),
    description: 'Patient missed 2 consecutive therapy sessions without notice.',
    actionTaken: true,
    resolvedAt: new Date('2024-01-15T09:00:00Z'),
    notes: 'Contacted patient. Rescheduling due to work conflicts. No immediate risk.'
  },
  {
    id: 'alert-004',
    patientId: 'patient-002',
    patientName: 'David Rodriguez',
    severity: 'medium' as const,
    type: 'self-harm-indicators' as const,
    triggeredAt: new Date('2024-01-13T22:45:00Z'),
    description: 'Journal entries contain concerning language about self-harm. Keywords flagged by AI.',
    actionTaken: true,
    resolvedAt: new Date('2024-01-14T08:30:00Z'),
    notes: 'Discussed in session. Metaphorical language, not literal intent. Safety plan reviewed.'
  },
  {
    id: 'alert-005',
    patientId: 'patient-003',
    patientName: 'Ashley Kim',
    severity: 'medium' as const,
    type: 'mood-decline' as const,
    triggeredAt: new Date('2024-01-12T18:20:00Z'),
    description: 'Anxiety levels increased significantly. Using crisis tools more frequently.',
    actionTaken: true,
    resolvedAt: new Date('2024-01-13T11:00:00Z'),
    notes: 'Temporary stress due to job interview. Coping well with DBT techniques.'
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

    // Verify provider access
    const userEmail = session.user.email
    const isProvider = userEmail.includes('provider') || userEmail.includes('therapist') || userEmail.includes('doctor')

    if (!isProvider) {
      return NextResponse.json(
        { error: 'Provider access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const status = searchParams.get('status') // 'active' or 'resolved'
    const patientId = searchParams.get('patientId')

    let filteredAlerts = mockAlerts

    // Apply filters
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }
    if (status === 'active') {
      filteredAlerts = filteredAlerts.filter(alert => !alert.actionTaken)
    } else if (status === 'resolved') {
      filteredAlerts = filteredAlerts.filter(alert => alert.actionTaken && alert.resolvedAt)
    }
    if (patientId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.patientId === patientId)
    }

    // Sort by severity and date (most urgent first)
    const severityOrder = { critical: 3, high: 2, medium: 1 }
    filteredAlerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    })

    const stats = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      high: filteredAlerts.filter(a => a.severity === 'high').length,
      medium: filteredAlerts.filter(a => a.severity === 'medium').length,
      unacknowledged: filteredAlerts.filter(a => !a.actionTaken).length,
      resolved: filteredAlerts.filter(a => a.actionTaken && a.resolvedAt).length
    }

    return NextResponse.json({
      success: true,
      alerts: filteredAlerts,
      stats,
      filters: { severity, status, patientId }
    })

  } catch (error) {
    console.error('Error in provider alerts GET:', error)
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

    // Verify provider access
    const userEmail = session.user.email
    const isProvider = userEmail.includes('provider') || userEmail.includes('therapist') || userEmail.includes('doctor')

    if (!isProvider) {
      return NextResponse.json(
        { error: 'Provider access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, patientId, severity, description, notes } = body

    // In production, this would create a new alert
    // For demo, we'll simulate the alert creation
    const newAlert = {
      id: `alert-${Date.now()}`,
      patientId,
      patientName: 'Unknown Patient', // Would be fetched from patient data
      severity,
      type,
      triggeredAt: new Date(),
      description,
      actionTaken: false,
      notes
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Alert created successfully'
    })

  } catch (error) {
    console.error('Error in provider alerts POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}