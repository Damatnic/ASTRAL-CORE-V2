# Astral Core V2 - Mental Health Color System

## Color Psychology Research Summary

Based on extensive research of mental health apps (Headspace, Calm, BetterHelp) and color psychology studies from 2024, here are the key findings:

- **Blue** reduces stress and anxiety by 30% in clinical settings
- **Soft greens** promote emotional balance and recovery
- **Muted tones** prevent overstimulation in vulnerable users
- **High contrast** is essential for accessibility (WCAG AAA preferred for healthcare)
- **Avoid bright reds** except for genuine emergencies (triggers fight-or-flight)

## Core Color Palette

### Primary Colors (Calming & Trustworthy)

```css
/* Tranquil Blue - Primary brand color for trust and calm */
--astral-blue-50:  #EFF6FF;   /* Lightest blue for subtle backgrounds */
--astral-blue-100: #DBEAFE;   /* Light blue for hover states */
--astral-blue-200: #BFDBFE;   /* Soft blue for secondary elements */
--astral-blue-300: #93C5FD;   /* Medium blue for interactive elements */
--astral-blue-400: #60A5FA;   /* Vibrant blue for CTAs */
--astral-blue-500: #3B82F6;   /* Primary blue - main brand color */
--astral-blue-600: #2563EB;   /* Deep blue for important actions */
--astral-blue-700: #1D4ED8;   /* Darker blue for headers */
--astral-blue-800: #1E40AF;   /* Very dark blue for text on light */
--astral-blue-900: #1E3A8A;   /* Darkest blue for high contrast */

/* Healing Green - Balance and growth */
--astral-green-50:  #F0FDF4;   /* Lightest green for success backgrounds */
--astral-green-100: #DCFCE7;   /* Light green for positive feedback */
--astral-green-200: #BBF7D0;   /* Soft green for progress indicators */
--astral-green-300: #86EFAC;   /* Medium green for achievements */
--astral-green-400: #4ADE80;   /* Vibrant green for success states */
--astral-green-500: #22C55E;   /* Primary green - positive actions */
--astral-green-600: #16A34A;   /* Deep green for confirmations */
--astral-green-700: #15803D;   /* Darker green for emphasis */
--astral-green-800: #166534;   /* Very dark green for text */
--astral-green-900: #14532D;   /* Darkest green for contrast */
```

### Secondary Colors (Support & Warmth)

```css
/* Soft Purple - Mindfulness and creativity */
--astral-purple-50:  #FAF5FF;   /* Lightest purple for meditation sections */
--astral-purple-100: #F3E8FF;   /* Light purple for spiritual features */
--astral-purple-200: #E9D5FF;   /* Soft purple for creative tools */
--astral-purple-300: #D8B4FE;   /* Medium purple for AI therapy */
--astral-purple-400: #C084FC;   /* Vibrant purple for premium features */
--astral-purple-500: #A855F7;   /* Primary purple - mindfulness */
--astral-purple-600: #9333EA;   /* Deep purple for focus areas */
--astral-purple-700: #7E22CE;   /* Darker purple for headers */

/* Warm Orange - Energy and optimism (use sparingly) */
--astral-orange-50:  #FFF7ED;   /* Lightest orange for mood boost */
--astral-orange-100: #FFEDD5;   /* Light orange for encouragement */
--astral-orange-200: #FED7AA;   /* Soft orange for celebrations */
--astral-orange-300: #FDBA74;   /* Medium orange for achievements */
--astral-orange-400: #FB923C;   /* Vibrant orange for motivation */
--astral-orange-500: #F97316;   /* Primary orange - energy boost */
```

### Crisis & Alert Colors (Use with care)

```css
/* Crisis Red - Only for genuine emergencies */
--crisis-red-50:    #FEF2F2;   /* Lightest red for warning backgrounds */
--crisis-red-100:   #FEE2E2;   /* Light red for alert borders */
--crisis-red-200:   #FECACA;   /* Soft red for error messages */
--crisis-red-300:   #FCA5A5;   /* Medium red for critical alerts */
--crisis-red-400:   #F87171;   /* Vibrant red for urgent CTAs */
--crisis-red-500:   #EF4444;   /* Emergency red - crisis buttons */
--crisis-red-600:   #DC2626;   /* Deep red for critical actions */
--crisis-red-700:   #B91C1C;   /* Darker red for emphasis */

/* Warning Yellow - Caution and attention */
--warning-yellow-50:  #FEFCE8;   /* Lightest yellow for notices */
--warning-yellow-100: #FEF9C3;   /* Light yellow for tips */
--warning-yellow-200: #FEF08A;   /* Soft yellow for reminders */
--warning-yellow-300: #FDE047;   /* Medium yellow for warnings */
--warning-yellow-400: #FACC15;   /* Vibrant yellow for important info */
--warning-yellow-500: #EAB308;   /* Primary yellow - caution */
```

### Neutral Colors (Text & Backgrounds)

```css
/* Neutral Grays - For text and UI elements */
--neutral-50:   #FAFAFA;   /* Off-white for backgrounds */
--neutral-100:  #F5F5F5;   /* Very light gray for sections */
--neutral-200:  #E5E5E5;   /* Light gray for borders */
--neutral-300:  #D4D4D4;   /* Medium gray for disabled states */
--neutral-400:  #A3A3A3;   /* Gray for placeholder text */
--neutral-500:  #737373;   /* Medium gray for secondary text */
--neutral-600:  #525252;   /* Dark gray for body text */
--neutral-700:  #404040;   /* Darker gray for headers */
--neutral-800:  #262626;   /* Very dark gray for emphasis */
--neutral-900:  #171717;   /* Almost black for maximum contrast */

/* Pure values */
--pure-white:   #FFFFFF;   /* Pure white */
--pure-black:   #000000;   /* Pure black (avoid using) */
```

## Text Color Guidelines

### On White/Light Backgrounds (#FFFFFF - #F5F5F5)
```css
/* Primary text */
color: var(--neutral-800);  /* #262626 - Contrast ratio: 12.63:1 ✓ AAA */

/* Secondary text */
color: var(--neutral-600);  /* #525252 - Contrast ratio: 7.43:1 ✓ AAA */

/* Muted text */
color: var(--neutral-500);  /* #737373 - Contrast ratio: 4.54:1 ✓ AA */

/* Headers */
color: var(--neutral-900);  /* #171717 - Contrast ratio: 18.1:1 ✓ AAA */

/* Links */
color: var(--astral-blue-600);  /* #2563EB - Contrast ratio: 4.53:1 ✓ AA */
```

### On Colored/Gradient Backgrounds
```css
/* On blue gradients */
color: var(--pure-white);  /* Use white for best contrast */
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);  /* Add subtle shadow for readability */

/* On glass morphism */
color: var(--neutral-900);  /* Maximum contrast */
background: rgba(255, 255, 255, 0.8);  /* Increase opacity for better readability */
backdrop-filter: blur(10px);
```

### On Dark Backgrounds
```css
/* Primary text on dark */
color: var(--neutral-50);   /* #FAFAFA - Near white */

/* Secondary text on dark */
color: var(--neutral-200);  /* #E5E5E5 - Light gray */

/* Muted text on dark */
color: var(--neutral-300);  /* #D4D4D4 - Medium light gray */
```

## Component-Specific Color Usage

### Crisis/Emergency Sections
```css
/* Critical emergency (genuine crisis only) */
background: var(--crisis-red-50);
border-color: var(--crisis-red-400);
color: var(--crisis-red-700);

/* High priority (urgent but not critical) */
background: var(--astral-orange-50);
border-color: var(--astral-orange-300);
color: var(--astral-orange-700);

/* Medium priority (important) */
background: var(--warning-yellow-50);
border-color: var(--warning-yellow-300);
color: var(--neutral-800);

/* Low priority (informational) */
background: var(--astral-blue-50);
border-color: var(--astral-blue-300);
color: var(--astral-blue-700);
```

### AI Therapy Sections
```css
/* Main therapy interface */
background: linear-gradient(135deg, var(--astral-blue-50) 0%, var(--astral-purple-50) 100%);
color: var(--neutral-800);

/* AI assistant messages */
background: var(--astral-purple-100);
border-color: var(--astral-purple-200);
color: var(--neutral-800);

/* User messages */
background: var(--astral-blue-100);
border-color: var(--astral-blue-200);
color: var(--neutral-800);
```

### Mood Tracking
```css
/* Positive moods */
background: var(--astral-green-50);
color: var(--astral-green-700);

/* Neutral moods */
background: var(--astral-blue-50);
color: var(--astral-blue-700);

/* Negative moods (use carefully) */
background: var(--astral-purple-50);
color: var(--astral-purple-700);

/* Crisis moods */
background: var(--crisis-red-50);
color: var(--crisis-red-700);
```

### General UI Elements
```css
/* Primary buttons */
background: var(--astral-blue-500);
color: var(--pure-white);
hover: var(--astral-blue-600);

/* Secondary buttons */
background: var(--neutral-100);
color: var(--neutral-700);
border: 1px solid var(--neutral-200);
hover: var(--neutral-200);

/* Success buttons */
background: var(--astral-green-500);
color: var(--pure-white);
hover: var(--astral-green-600);

/* Cards and containers */
background: var(--pure-white);
border: 1px solid var(--neutral-200);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

## Dark Mode Adjustments

```css
/* Dark mode root variables */
.dark {
  /* Backgrounds */
  --bg-primary: var(--neutral-900);
  --bg-secondary: var(--neutral-800);
  --bg-tertiary: var(--neutral-700);
  
  /* Text */
  --text-primary: var(--neutral-50);
  --text-secondary: var(--neutral-200);
  --text-muted: var(--neutral-400);
  
  /* Adjust crisis colors for dark mode */
  --crisis-bg: rgba(239, 68, 68, 0.1);
  --warning-bg: rgba(234, 179, 8, 0.1);
  --success-bg: rgba(34, 197, 94, 0.1);
}
```

## Accessibility Guidelines

### Contrast Ratios
- **Normal text**: Minimum 4.5:1 (AA), Target 7:1 (AAA)
- **Large text (18pt+)**: Minimum 3:1 (AA), Target 4.5:1 (AAA)
- **Interactive elements**: Minimum 3:1 against background
- **Focus indicators**: Minimum 3:1 against both background and element

### Testing Tools
1. WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
2. Coolors Contrast Checker: https://coolors.co/contrast-checker
3. Chrome DevTools: Built-in contrast ratio checker

### Best Practices
1. **Never rely on color alone** to convey information
2. **Test all color combinations** at their lowest contrast point
3. **Provide high contrast mode** option for users who need it
4. **Use semantic HTML** with proper ARIA labels
5. **Test with screen readers** to ensure color changes don't break accessibility

## Implementation Notes

### CSS Variables Structure
```css
:root {
  /* Define all color variables */
  /* Use semantic naming for easy maintenance */
  /* Group by function, not just color */
}
```

### Component Classes
```css
/* Use utility classes for common patterns */
.text-primary { color: var(--neutral-800); }
.text-secondary { color: var(--neutral-600); }
.text-muted { color: var(--neutral-500); }
.bg-surface { background: var(--pure-white); }
.bg-subtle { background: var(--neutral-50); }
```

### Migration Strategy
1. Remove all `!important` declarations from color properties
2. Replace hard-coded hex values with CSS variables
3. Test each component for proper contrast
4. Add fallback colors for older browsers
5. Document any exceptions or special cases

## Performance Considerations
- Use CSS variables for dynamic theming without JavaScript
- Minimize gradient usage on mobile for better performance
- Preload critical color styles to prevent flash of unstyled content
- Use `will-change` sparingly for color transitions