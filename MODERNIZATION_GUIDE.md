# Astral Core V2 - Modernization Guide

## Overview
This document outlines the modernization updates completed for Astral Core V2, including performance optimizations, UI animations, monitoring capabilities, and best practices for maintaining a high-performance mental health application.

## Table of Contents
1. [Performance Optimization](#performance-optimization)
2. [Modern UI Animations](#modern-ui-animations)
3. [Monitoring & Observability](#monitoring--observability)
4. [Development Setup](#development-setup)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)

---

## Performance Optimization

### Configuration Location
`/config/performance.config.js`

### Key Features

#### 1. Core Web Vitals Optimization
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **INP (Interaction to Next Paint)**: Target < 200ms

#### 2. Caching Strategies
```javascript
// Static assets - 1 year cache
static: {
  maxAge: 31536000,
  immutable: true
}

// API responses - varied by endpoint
api: {
  userData: { maxAge: 300, private: true },
  crisis: { noStore: true }, // Never cache crisis data
  publicContent: { maxAge: 3600, public: true }
}
```

#### 3. Bundle Optimization
- Code splitting by route and component
- Dynamic imports for heavy components
- Tree shaking enabled
- Minification for production builds

#### 4. Image Optimization
- Automatic format conversion (AVIF, WebP)
- Responsive image sizing
- Lazy loading with intersection observer
- Blur placeholder for better UX

### Implementation Example
```javascript
import performanceConfig from '/config/performance.config.js';

// Apply caching strategy
const cacheStrategy = performanceConfig.caching.api.userData;
res.setHeader('Cache-Control', `max-age=${cacheStrategy.maxAge}`);

// Use image optimization
const imageConfig = performanceConfig.images;
<Image 
  src={url}
  sizes={imageConfig.responsive.breakpoints}
  loading="lazy"
/>
```

---

## Modern UI Animations

### Location
`/packages/ui/src/animations/`

### Animation Library Features

#### 1. Core Animations
```typescript
import { animations, transitions, easings } from '@ui/animations/modern-animations';

// Fade in animation
<div style={{ animation: `${animations.fadeIn} 300ms ${easings.standard}` }} />

// Smooth transitions
<button style={{ transition: transitions.allSafe }} />
```

#### 2. Pre-built Components
```typescript
import {
  FadeInContainer,
  FloatingCard,
  BreathingCircle,
  AnimatedButton,
  ScrollReveal,
  AnimatedModal,
  Toast,
  Skeleton
} from '@ui/animations/AnimatedComponents';

// Usage examples
<ScrollReveal animation="slideInLeft">
  <Card>Content reveals on scroll</Card>
</ScrollReveal>

<BreathingCircle /> // For mindfulness exercises

<AnimatedModal open={open} onClose={handleClose}>
  Modal content with smooth animations
</AnimatedModal>
```

#### 3. Accessibility Considerations
- Respects `prefers-reduced-motion` setting
- Provides fallback animations for accessibility
- Smooth, non-jarring animations for mental health context

#### 4. Animation Utilities
```typescript
import { animationUtils } from '@ui/animations/modern-animations';

// Stagger list items
animationUtils.staggerChildren(container, '.list-item', animation, 50);

// Smooth scroll
animationUtils.smoothScrollTo(targetElement, 500);

// Observe for scroll animations
const observer = animationUtils.observeForAnimation(
  elements,
  'animate-on-scroll'
);
```

---

## Monitoring & Observability

### Endpoints

#### 1. Performance Monitoring
**Endpoint**: `/api/monitoring/performance`

**POST** - Submit performance metrics
```typescript
POST /api/monitoring/performance
{
  lcp: 2400,
  fid: 95,
  cls: 0.05,
  context: {
    url: "https://app.astralcore.org/dashboard",
    userAgent: "...",
    viewport: { width: 1920, height: 1080 }
  },
  session: {
    id: "session-123",
    timestamp: "2025-01-16T10:00:00Z"
  }
}
```

**GET** - Retrieve performance analytics
```typescript
GET /api/monitoring/performance?period=1h&metric=lcp
Response: {
  summary: {
    lcp: {
      mean: 2300,
      p75: 2450,
      p95: 2800,
      evaluation: "good"
    }
  },
  healthScore: 85,
  recommendations: [...]
}
```

#### 2. Health Check
**Endpoint**: `/api/monitoring/health`

**GET** - System health status
```typescript
GET /api/monitoring/health?detailed=true
Response: {
  status: "healthy",
  services: [
    { name: "database", status: "healthy", responseTime: 45 },
    { name: "redis", status: "healthy", responseTime: 12 },
    { name: "api", status: "healthy", responseTime: 89 }
  ],
  system: {
    cpu: { usage: 45, cores: 8 },
    memory: { percentage: 62 }
  },
  checks: {
    database: true,
    redis: true,
    api: true
  }
}
```

**Quick health check for load balancers**:
```
GET /api/monitoring/health?quick=true
Response: { status: "ok" }
```

#### 3. Error Monitoring
**Endpoint**: `/api/monitoring/errors`

**POST** - Report errors
```typescript
POST /api/monitoring/errors
{
  error: {
    message: "Failed to load user profile",
    stack: "...",
    severity: "high",
    category: "network"
  },
  context: {
    url: "/profile",
    userAgent: "...",
    timestamp: "2025-01-16T10:00:00Z",
    user: { id: "user-123" }
  },
  breadcrumbs: [
    { timestamp: "...", type: "navigation", message: "Navigated to /profile" }
  ]
}
```

**GET** - Error statistics
```typescript
GET /api/monitoring/errors?view=summary&period=24h
Response: {
  total: 145,
  errorRate: 2.4,
  severityDistribution: {
    critical: 2,
    high: 15,
    medium: 78,
    low: 50
  },
  topErrors: [...],
  errorTrend: { increasing: false }
}
```

---

## Development Setup

### Installation
```bash
# Install dependencies
pnpm install

# Install specific packages if needed
pnpm add -D @eslint/js -w

# Build all packages
pnpm turbo build

# Run development server
pnpm dev
```

### Environment Variables
```env
# Performance monitoring
MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.1

# Error tracking
ERROR_REPORTING_ENABLED=true
SENTRY_DSN=your-sentry-dsn

# Cache configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
```

### Testing Performance
```bash
# Run performance tests
pnpm test:performance

# Analyze bundle size
ANALYZE=true pnpm build

# Check Core Web Vitals
pnpm lighthouse
```

---

## API Reference

### Performance Config API
```javascript
import performanceConfig from '/config/performance.config.js';

// Access configuration
const { webVitals, caching, bundling, images, monitoring } = performanceConfig;

// Apply optimizations
const cacheHeaders = caching.api.userData;
const imageOptimization = images.lazyLoading;
const monitoringSettings = monitoring.performance;
```

### Animation API
```typescript
import modernAnimations from '@ui/animations/modern-animations';

// Access animation presets
const { easings, durations, animations, transitions, presets } = modernAnimations;

// Use animation utilities
const { animationUtils, useAnimation } = modernAnimations;

// Apply animations
element.style.animation = `${animations.fadeIn} ${durations.normal}ms ${easings.standard}`;
```

### Monitoring Client
```typescript
// Report performance metrics
async function reportPerformance(metrics) {
  await fetch('/api/monitoring/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });
}

// Report errors
async function reportError(error, context) {
  await fetch('/api/monitoring/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error, context })
  });
}

// Check health
async function checkHealth() {
  const response = await fetch('/api/monitoring/health');
  return response.json();
}
```

---

## Best Practices

### Performance
1. **Always measure before optimizing** - Use monitoring endpoints to identify bottlenecks
2. **Prioritize Core Web Vitals** - Focus on LCP, FID, and CLS first
3. **Implement progressive enhancement** - Basic functionality should work without JavaScript
4. **Use code splitting** - Load only what's needed for the current page
5. **Optimize images** - Use modern formats and responsive sizing

### Animations
1. **Respect user preferences** - Check for `prefers-reduced-motion`
2. **Keep animations subtle** - Especially important for mental health applications
3. **Use CSS transforms** - Better performance than animating layout properties
4. **Avoid animation on critical paths** - Don't delay important content
5. **Test on low-end devices** - Ensure animations don't cause jank

### Monitoring
1. **Set up alerts** - Configure thresholds for critical metrics
2. **Track user journeys** - Use breadcrumbs to understand error context
3. **Sample appropriately** - Balance data collection with performance impact
4. **Review regularly** - Weekly reviews of performance and error trends
5. **Act on insights** - Use recommendations from monitoring endpoints

### Mental Health Considerations
1. **Calming animations** - Use gentle easings and avoid jarring movements
2. **Crisis optimization** - Ensure crisis endpoints have zero cache and highest priority
3. **Accessibility first** - All features must be accessible to users with disabilities
4. **Privacy by design** - Minimize data collection and ensure secure transmission
5. **Graceful degradation** - App should remain functional even if features fail

### Code Quality
1. **Type safety** - Use TypeScript for all new code
2. **Component isolation** - Keep components small and focused
3. **Documentation** - Document complex logic and API contracts
4. **Testing** - Write tests for critical paths and edge cases
5. **Code reviews** - All changes should be reviewed before merging

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
pnpm clean
rm -rf node_modules
pnpm install
pnpm turbo build --force
```

#### Performance Issues
1. Check monitoring dashboard at `/api/monitoring/performance?view=summary`
2. Review Core Web Vitals scores
3. Analyze bundle size with `ANALYZE=true pnpm build`
4. Profile with Chrome DevTools Performance tab

#### Animation Jank
1. Use CSS transforms instead of position properties
2. Add `will-change` property for animated elements
3. Reduce animation complexity on mobile devices
4. Check GPU acceleration in DevTools Rendering tab

#### Monitoring Data Not Appearing
1. Verify endpoints are accessible
2. Check CORS configuration
3. Ensure monitoring is enabled in environment variables
4. Review browser console for errors

---

## Migration Guide

### From V1 to V2

#### Update imports
```typescript
// Old
import { fadeIn } from '@/utils/animations';

// New
import { animations } from '@ui/animations/modern-animations';
const { fadeIn } = animations;
```

#### Update monitoring
```typescript
// Old
console.log('Performance:', metrics);

// New
await reportPerformance(metrics);
```

#### Update caching
```typescript
// Old
res.setHeader('Cache-Control', 'max-age=300');

// New
import performanceConfig from '/config/performance.config.js';
const cacheStrategy = performanceConfig.caching.api.userData;
res.setHeader('Cache-Control', `max-age=${cacheStrategy.maxAge}`);
```

---

## Resources

### Documentation
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing/performance)
- [Web.dev Performance](https://web.dev/performance/)
- [MDN Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### Mental Health UX Resources
- [Designing for Mental Health](https://www.nngroup.com/articles/mental-health-ux/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Crisis Response Best Practices](https://www.crisis.org/best-practices)

---

## Changelog

### Version 2.0.0 (2025-01-16)
- ✅ Added comprehensive performance optimization configuration
- ✅ Implemented modern UI animation library
- ✅ Created monitoring endpoints for performance, health, and errors
- ✅ Integrated ESLint with @eslint/js
- ✅ Enhanced accessibility features
- ✅ Optimized for Core Web Vitals
- ✅ Added crisis-specific optimizations

---

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Contact the development team
- Review the monitoring dashboards for system status

Remember: In mental health applications, user experience and accessibility are paramount. Every optimization should enhance, not hinder, the user's journey to better mental health.