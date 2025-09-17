/**
 * ASTRAL_CORE 2.0 Database Seeder
 * Seeds essential crisis resources and system data
 */

import { prisma, ResourceCategory, HealthStatus } from './';

async function main() {
  console.log('🌱 Seeding ASTRAL_CORE 2.0 database...');

  // Seed crisis resources
  console.log('📞 Seeding crisis resources...');
  
  const crisisResources = [
    {
      id: 'resource-988-lifeline',
      title: '988 Suicide & Crisis Lifeline',
      description: '24/7 free and confidential emotional support for people in suicidal crisis or emotional distress',
      category: ResourceCategory.CRISIS_HOTLINE,
      phoneNumber: '988',
      url: 'https://988lifeline.org',
      available24_7: true,
      languages: ['en', 'es'],
      countries: ['US'],
      priority: 100,
      isEmergency: true,
      severityMin: 1,
      tags: ['suicide', 'crisis', 'depression', '24/7'],
      instructions: [
        'Dial 988 from any phone',
        'Text "HELLO" to 741741 for text support',
        'Chat online at 988lifeline.org'
      ]
    },
    {
      id: 'resource-crisis-text',
      title: 'Crisis Text Line',
      description: 'Free 24/7 text-based mental health support',
      category: ResourceCategory.CRISIS_HOTLINE,
      textNumber: '741741',
      url: 'https://crisistextline.org',
      available24_7: true,
      languages: ['en', 'es'],
      countries: ['US', 'CA', 'UK'],
      priority: 95,
      isEmergency: true,
      severityMin: 3,
      tags: ['text', 'chat', 'crisis', '24/7'],
      instructions: [
        'Text HOME to 741741',
        'A trained crisis counselor will respond',
        'All conversations are confidential'
      ]
    },
    {
      id: 'resource-samhsa',
      title: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service for mental health and substance use disorders',
      category: ResourceCategory.CRISIS_HOTLINE,
      phoneNumber: '1-800-662-4357',
      url: 'https://samhsa.gov',
      available24_7: true,
      languages: ['en', 'es'],
      countries: ['US'],
      priority: 85,
      isEmergency: false,
      severityMin: 2,
      tags: ['referral', 'treatment', 'substance-use'],
      instructions: [
        'Call 1-800-662-HELP (4357)',
        'Available 24/7, 365 days a year',
        'Free, confidential treatment referral service'
      ]
    },
    {
      id: 'resource-emergency',
      title: 'Emergency Services',
      description: 'Call for immediate life-threatening emergencies',
      category: ResourceCategory.EMERGENCY_SERVICE,
      phoneNumber: '911',
      available24_7: true,
      languages: ['en', 'es', 'fr'],
      countries: ['US', 'CA'],
      priority: 100,
      isEmergency: true,
      severityMin: 9,
      tags: ['emergency', 'police', 'ambulance', 'fire'],
      instructions: [
        'Call 911 immediately',
        'Stay on the line',
        'Provide your location',
        'Follow dispatcher instructions'
      ]
    },
    {
      id: 'resource-54321-grounding',
      title: '5-4-3-2-1 Grounding Technique',
      description: 'A mindfulness technique to manage anxiety and panic attacks',
      category: ResourceCategory.GROUNDING_TECHNIQUE,
      priority: 70,
      isEmergency: false,
      severityMin: 1,
      tags: ['anxiety', 'panic', 'grounding', 'mindfulness'],
      content: `5-4-3-2-1 Grounding Technique:

5 THINGS YOU CAN SEE
Look around and name 5 things you can see in detail.

4 THINGS YOU CAN TOUCH
Notice 4 things you can physically feel (chair, clothing, temperature).

3 THINGS YOU CAN HEAR
Listen for 3 different sounds around you.

2 THINGS YOU CAN SMELL
Identify 2 different scents in your environment.

1 THING YOU CAN TASTE
Notice 1 taste in your mouth or take a sip of water.

This technique helps ground you in the present moment and can reduce anxiety symptoms.`,
      instructions: [
        'Find a comfortable position',
        'Take a few deep breaths',
        'Work through each sense slowly',
        'Focus on the present moment'
      ]
    },
    {
      id: 'resource-box-breathing',
      title: 'Box Breathing Exercise',
      description: '4-4-4-4 breathing pattern to reduce stress and anxiety',
      category: ResourceCategory.BREATHING_EXERCISE,
      priority: 75,
      isEmergency: false,
      severityMin: 1,
      tags: ['breathing', 'anxiety', 'stress', 'calm'],
      content: `Box Breathing (4-4-4-4):

1. INHALE for 4 counts
2. HOLD for 4 counts  
3. EXHALE for 4 counts
4. HOLD empty for 4 counts
5. REPEAT

This breathing pattern activates your parasympathetic nervous system and promotes calm.`,
      instructions: [
        'Sit comfortably with good posture',
        'Place one hand on chest, one on belly',
        'Breathe through your nose',
        'Count slowly and steadily',
        'Continue for 5-10 cycles'
      ]
    }
  ];

  for (const resource of crisisResources) {
    await prisma.crisisResource.upsert({
      where: { id: resource.id },
      update: resource,
      create: resource,
    });
  }

  console.log(`✅ Seeded ${crisisResources.length} crisis resources`);

  // Seed public metrics for transparency dashboard
  console.log('📊 Seeding public metrics...');
  
  const publicMetrics = [
    {
      metricName: 'lives_helped_today',
      value: 0,
      displayValue: '0',
      description: 'Lives helped through crisis intervention today',
      isPublic: true,
      displayOrder: 1,
      icon: '❤️',
      color: '#ef4444',
      updateFrequency: 'realtime'
    },
    {
      metricName: 'average_response_time',
      value: 0,
      displayValue: '0ms',
      description: 'Average crisis response time (target: <200ms)',
      isPublic: true,
      displayOrder: 2,
      icon: '⚡',
      color: '#10b981',
      updateFrequency: 'realtime'
    },
    {
      metricName: 'volunteers_online',
      value: 0,
      displayValue: '0',
      description: 'Trained crisis volunteers currently available',
      isPublic: true,
      displayOrder: 3,
      icon: '🤝',
      color: '#3b82f6',
      updateFrequency: 'realtime'
    },
    {
      metricName: 'uptime_percentage',
      value: 99.99,
      displayValue: '99.99%',
      description: 'Platform uptime (target: 99.99%)',
      isPublic: true,
      displayOrder: 4,
      icon: '🔄',
      color: '#8b5cf6',
      updateFrequency: 'hourly'
    },
    {
      metricName: 'sessions_this_month',
      value: 0,
      displayValue: '0',
      description: 'Crisis intervention sessions this month',
      isPublic: true,
      displayOrder: 5,
      icon: '📈',
      color: '#f59e0b',
      updateFrequency: 'daily'
    }
  ];

  for (const metric of publicMetrics) {
    await prisma.publicMetrics.upsert({
      where: { metricName: metric.metricName },
      update: metric,
      create: metric,
    });
  }

  console.log(`✅ Seeded ${publicMetrics.length} public metrics`);

  // Create initial system health records
  console.log('🏥 Initializing system health monitoring...');
  
  const healthComponents = [
    { component: 'crisis_api', status: HealthStatus.HEALTHY },
    { component: 'websocket_server', status: HealthStatus.HEALTHY },
    { component: 'database', status: HealthStatus.HEALTHY },
    { component: 'tether_engine', status: HealthStatus.HEALTHY },
    { component: 'volunteer_matching', status: HealthStatus.HEALTHY },
    { component: 'emergency_escalation', status: HealthStatus.HEALTHY }
  ];

  for (const health of healthComponents) {
    await prisma.systemHealth.create({
      data: {
        ...health,
        responseTime: 0,
        uptime: 100,
        errorRate: 0,
      },
    });
  }

  console.log(`✅ Initialized ${healthComponents.length} health monitoring components`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('ASTRAL_CORE 2.0 is ready to save lives. 💙');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
