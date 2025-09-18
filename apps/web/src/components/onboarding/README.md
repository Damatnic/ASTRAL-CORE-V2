# ASTRAL CORE Onboarding System

## Overview

The onboarding system for ASTRAL CORE is designed with mental health and crisis safety as the top priority. It provides a gentle, non-overwhelming introduction to the platform that respects user autonomy and ensures immediate access to crisis resources.

## Key Features

### 🚨 Crisis-Safe Design
- **Emergency Exit**: Ctrl+Esc immediately exits onboarding and focuses crisis resources
- **Always Accessible**: Crisis hotlines (988, 741741) visible on every onboarding screen  
- **No Barriers**: Crisis users can access help without completing onboarding
- **Trauma-Informed**: Uses gentle language and gives users complete control

### 🎯 Progressive Disclosure
- **Customized Journeys**: Different onboarding flows for crisis, general, volunteer, and professional users
- **Optional Steps**: Users can skip non-essential information
- **Gentle Pacing**: Information presented in digestible chunks
- **Visual Hierarchy**: Clear priorities with crisis resources always prominent

### ♿ Accessibility Features
- **Keyboard Navigation**: Full keyboard support with helpful shortcuts
- **Screen Reader Optimized**: Proper ARIA labels and semantic HTML
- **High Contrast Mode**: Support for accessibility preferences
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Logical tab order and focus indicators

### 🔒 Privacy-First
- **Anonymous Option**: Users can use platform without creating accounts
- **Data Control**: Users choose what information to share
- **Local Storage**: Preferences saved locally, not tracked externally
- **Consent-Based**: Opt-in approach for all non-essential features

## Architecture

### Context Provider (`OnboardingContext.tsx`)
Manages global onboarding state including:
- Current step and journey type
- User preferences (accessibility, privacy)
- Completion tracking
- Local storage persistence

### Main Flow Component (`OnboardingFlow.tsx`)
- Orchestrates step progression
- Handles keyboard shortcuts and accessibility
- Renders crisis safety header on all screens
- Manages modal display and transitions

### Step Components (`steps/`)
Each step is a self-contained component with:
- **WelcomeStep**: Journey selection and privacy choices
- **CrisisSafetyStep**: Crisis resources and safety information
- **PlatformOverviewStep**: Feature introduction and how it works
- **MoodTrackingIntroStep**: Interactive mood tracking demo
- **SafetyPlanningIntroStep**: Safety plan explanation with demo
- **WellnessToolsIntroStep**: Self-care tools overview
- **PersonalizationStep**: Accessibility and preference settings
- **CrisisResourcesStep**: Comprehensive crisis resource information
- **CompleteStep**: Celebration and next steps

### Trigger Components (`OnboardingTrigger.tsx`)
Provides multiple ways to start onboarding:
- Button variant for navigation bars
- Card variant for dashboard placement
- Banner variant for first-time visitors

## User Journeys

### 🆘 Crisis Journey
**Priority**: Immediate safety and crisis resources
**Steps**: Welcome → Crisis Safety → Crisis Resources → Basic Tools → Complete
**Features**: 
- Cannot skip safety information
- Fast-track to crisis support
- Simplified feature introduction
- Emergency contact emphasis

### 🧠 General Mental Health Journey  
**Priority**: Comprehensive platform understanding
**Steps**: Welcome → Platform Overview → Mood Tracking → Safety Planning → Wellness Tools → Personalization → Crisis Resources → Complete
**Features**:
- Full feature tour
- Interactive demonstrations
- Personalization options
- Progressive complexity

### 🤝 Volunteer Journey
**Priority**: Helper tools and crisis response training
**Steps**: Welcome → Platform Overview → Crisis Resources → Personalization → Complete
**Features**:
- Crisis intervention focus
- Professional standards information
- Ethical guidelines
- Training resources

### 👩‍⚕️ Professional Journey
**Priority**: Clinical tools and professional features
**Steps**: Welcome → Platform Overview → Crisis Resources → Personalization → Complete
**Features**:
- Evidence-based tool information
- Professional compliance
- Client management overview
- Integration capabilities

## Implementation Guidelines

### For Developers

1. **Crisis Safety First**: Always ensure crisis resources are accessible
2. **Gentle UX**: Use soft animations, calming colors, generous whitespace
3. **Respect Autonomy**: Provide exit options and user control
4. **Test Accessibility**: Verify keyboard navigation and screen reader support
5. **Monitor Performance**: Ensure fast loading for users in crisis

### For Content

1. **Use Trauma-Informed Language**: Avoid clinical jargon, be warm and supportive
2. **Validate User Experience**: Acknowledge the courage it takes to seek help
3. **Focus on Benefits**: Explain how features help, not just what they do
4. **Provide Context**: Explain why certain information is important
5. **Maintain Hope**: Include encouraging and empowering messages

### For Designers

1. **Calming Color Palette**: Blues, greens, soft grays with accessibility-compliant contrast
2. **Generous Whitespace**: Avoid cognitive overload with clean layouts
3. **Clear Hierarchy**: Crisis resources should be most prominent
4. **Consistent Interactions**: Predictable button behaviors and hover states
5. **Mobile-First**: Ensure excellent experience on all devices

## Usage Examples

### Basic Integration
```tsx
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

function App() {
  return (
    <OnboardingProvider autoStart={true}>
      <YourAppContent />
      <OnboardingFlow />
    </OnboardingProvider>
  );
}
```

### Manual Trigger
```tsx
import { useOnboarding } from '@/contexts/OnboardingContext';

function WelcomeButton() {
  const { startOnboarding } = useOnboarding();
  
  return (
    <button onClick={() => startOnboarding('general')}>
      Take Tour
    </button>
  );
}
```

### Trigger Components
```tsx
import OnboardingTrigger from '@/components/onboarding/OnboardingTrigger';

// Simple button
<OnboardingTrigger variant="button" />

// Welcome banner for new users
<OnboardingTrigger variant="banner" showOptions={true} />

// Dashboard card
<OnboardingTrigger variant="card" showOptions={false} />
```

## Customization

### Adding New Steps
1. Create step component in `steps/` directory
2. Add to `stepComponents` mapping in `OnboardingFlow.tsx`
3. Update step flow in `OnboardingContext.tsx`
4. Add step title to `stepTitles` object

### Modifying Journeys
Edit the `getStepFlow` function in `OnboardingContext.tsx` to adjust step sequences for different user types.

### Styling
The system uses Tailwind CSS with a focus on:
- Calming colors (blues, greens, soft grays)
- Accessible contrast ratios
- Responsive design
- Gentle animations with Framer Motion

## Monitoring and Analytics

### Success Metrics
- Onboarding completion rates by journey type
- Time spent on each step
- Feature adoption after onboarding
- Crisis resource usage during onboarding
- User satisfaction scores

### A/B Testing Opportunities
- Different onboarding flow sequences
- Message tone and content variations
- Visual design improvements
- Crisis resource presentation methods

## Safety Considerations

### Crisis Response
- Never block access to crisis resources
- Provide multiple contact methods (call, text, chat)
- Include local emergency services information
- Train staff on crisis intervention protocols

### Privacy Protection
- Minimize data collection during onboarding
- Explain clearly what information is stored
- Provide easy ways to delete data
- Respect user anonymity preferences

### Accessibility Compliance
- WCAG 2.1 AA compliance minimum
- Regular accessibility audits
- User testing with assistive technologies
- Keyboard-only navigation support

## Support and Maintenance

### Regular Updates
- Review crisis resource phone numbers quarterly
- Update content based on user feedback
- Monitor completion rates and adjust flow as needed
- Keep accessibility features current with standards

### User Feedback Integration
- Collect feedback on onboarding experience
- Monitor drop-off points in the flow
- Test with real users, especially those in crisis
- Iterate based on mental health professional input

---

The onboarding system is a critical first impression for users who may be in vulnerable states. Every design and content decision should prioritize user safety, comfort, and empowerment while providing the information needed to effectively use the platform for mental health support.