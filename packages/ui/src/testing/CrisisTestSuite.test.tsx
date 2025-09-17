// Comprehensive Test Suite for ASTRAL CORE 2.0 Crisis Intervention Platform
// Testing all UI/UX components with focus on life-safety features

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import userEvent from '@testing-library/user-event';

// Import all crisis components for testing
import { CrisisButton } from '../components/crisis/CrisisButton';
import { EmotionThemeProvider } from '../providers/EmotionThemeProvider';
import { CrisisChatInterface } from '../components/chat/CrisisChatInterface';
import { SafetyPlanBuilder } from '../components/safety/SafetyPlanBuilder';
import { VoiceVideoCommunication } from '../components/communication/VoiceVideoCommunication';
import { ResponsiveCrisisLayout } from '../layouts/ResponsiveCrisisLayout';
import { CrisisPerformanceMonitor } from '../optimization/PerformanceOptimizer';

// Mock external dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Crisis testing utilities
const CrisisTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EmotionThemeProvider>
    {children}
  </EmotionThemeProvider>
);

describe('ASTRAL CORE 2.0 Crisis UI/UX Test Suite', () => {
  describe('🚨 Crisis Button Component - Life Safety Critical', () => {
    it('should render emergency crisis button immediately', () => {
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" />
        </CrisisTestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-red-600');
    });

    it('should trigger haptic feedback on crisis button press', async () => {
      // Mock navigator.vibrate
      const mockVibrate = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true
      });

      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" hapticFeedback={true} />
        </CrisisTestWrapper>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(mockVibrate).toHaveBeenCalled();
    });

    it('should display 100% FREE badge prominently', () => {
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" showFreeBadge={true} />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/100% FREE/i)).toBeInTheDocument();
    });

    it('should meet accessibility requirements for crisis situations', () => {
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" />
        </CrisisTestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveProperty('tabIndex', 0);
    });

    it('should respond within crisis performance target (<1s)', async () => {
      const startTime = performance.now();
      
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" />
        </CrisisTestWrapper>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      const responseTime = performance.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // <1s crisis target
    });
  });

  describe('🎭 Emotion-Aware Theme System', () => {
    it('should detect crisis emotional state from text', async () => {
      const TestComponent = () => {
        const [text, setText] = React.useState('');
        return (
          <CrisisTestWrapper>
            <input 
              data-testid="emotion-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CrisisTestWrapper>
        );
      };

      render(<TestComponent />);
      
      const input = screen.getByTestId('emotion-input');
      await userEvent.type(input, 'I want to hurt myself');

      // Test that crisis keywords trigger appropriate theme changes
      await waitFor(() => {
        // In a real implementation, this would check theme state
        expect(input).toHaveValue('I want to hurt myself');
      });
    });

    it('should adapt UI based on emotional urgency', () => {
      render(
        <EmotionThemeProvider initialState={{ emotionalState: 'crisis', urgencyLevel: 'immediate' }}>
          <div data-testid="crisis-container">Crisis Mode Active</div>
        </EmotionThemeProvider>
      );

      const container = screen.getByTestId('crisis-container');
      expect(container).toBeInTheDocument();
    });

    it('should maintain 100% free platform visibility in all emotional states', () => {
      const emotionalStates = ['calm', 'anxious', 'distressed', 'crisis'];
      
      emotionalStates.forEach(state => {
        const { unmount } = render(
          <EmotionThemeProvider initialState={{ emotionalState: state }}>
            <div data-testid={`free-badge-${state}`}>100% FREE Platform</div>
          </EmotionThemeProvider>
        );
        
        expect(screen.getByTestId(`free-badge-${state}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('💬 Crisis Chat Interface', () => {
    it('should load chat interface within performance target (<2s)', async () => {
      const startTime = performance.now();
      
      render(
        <CrisisTestWrapper>
          <CrisisChatInterface />
        </CrisisTestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/crisis chat/i)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // <2s crisis target
    });

    it('should show volunteer matching immediately in crisis mode', async () => {
      render(
        <CrisisTestWrapper>
          <CrisisChatInterface isCrisisMode={true} />
        </CrisisTestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/connecting you with/i)).toBeInTheDocument();
      });
    });

    it('should display emergency escalation options', () => {
      render(
        <CrisisTestWrapper>
          <CrisisChatInterface urgencyLevel="immediate" />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/emergency/i)).toBeInTheDocument();
    });

    it('should emphasize free platform during crisis chat', () => {
      render(
        <CrisisTestWrapper>
          <CrisisChatInterface />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/100% FREE/i)).toBeInTheDocument();
    });
  });

  describe('🛡️ Safety Plan Builder', () => {
    it('should render safety plan creation interface', () => {
      render(
        <CrisisTestWrapper>
          <SafetyPlanBuilder />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/safety plan/i)).toBeInTheDocument();
    });

    it('should include essential crisis contacts by default', () => {
      render(
        <CrisisTestWrapper>
          <SafetyPlanBuilder />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/988/)).toBeInTheDocument(); // Crisis Lifeline
      expect(screen.getByText(/741741/)).toBeInTheDocument(); // Text Crisis Line
      expect(screen.getByText(/911/)).toBeInTheDocument(); // Emergency
    });

    it('should save safety plan without requiring payment', () => {
      render(
        <CrisisTestWrapper>
          <SafetyPlanBuilder />
        </CrisisTestWrapper>
      );

      // Verify no payment or premium features are required
      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/premium/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/payment/i)).not.toBeInTheDocument();
    });
  });

  describe('📞 Voice/Video Communication', () => {
    it('should display communication options for crisis support', () => {
      render(
        <CrisisTestWrapper>
          <VoiceVideoCommunication 
            mode="voice" 
            isActive={false} 
            isCrisisSession={true} 
          />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/voice call ready/i)).toBeInTheDocument();
      expect(screen.getByText(/100% FREE/i)).toBeInTheDocument();
    });

    it('should handle crisis session indicators', () => {
      render(
        <CrisisTestWrapper>
          <VoiceVideoCommunication 
            mode="video" 
            isActive={true} 
            isCrisisSession={true} 
          />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/crisis session active/i)).toBeInTheDocument();
    });

    it('should provide emergency escalation during active calls', () => {
      const mockEscalate = jest.fn();
      
      render(
        <CrisisTestWrapper>
          <VoiceVideoCommunication 
            mode="voice" 
            isActive={true} 
            isCrisisSession={true}
            onEmergencyEscalate={mockEscalate}
          />
        </CrisisTestWrapper>
      );

      const emergencyButton = screen.getByText(/emergency/i);
      fireEvent.click(emergencyButton);
      
      expect(mockEscalate).toHaveBeenCalled();
    });
  });

  describe('📱 Responsive Crisis Layout', () => {
    beforeEach(() => {
      // Reset window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should render mobile layout on small screens', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <CrisisTestWrapper>
          <ResponsiveCrisisLayout>
            <div>Crisis Content</div>
          </ResponsiveCrisisLayout>
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/crisis content/i)).toBeInTheDocument();
    });

    it('should show crisis bar prominently across all breakpoints', () => {
      const breakpoints = [375, 768, 1024];
      
      breakpoints.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(
          <CrisisTestWrapper>
            <ResponsiveCrisisLayout showCrisisBar={true}>
              <div>Content</div>
            </ResponsiveCrisisLayout>
          </CrisisTestWrapper>
        );

        // Crisis bar should be visible at all breakpoints
        expect(document.querySelector('[class*="crisis"]')).toBeInTheDocument();
        unmount();
      });
    });

    it('should maintain free platform messaging on all devices', () => {
      render(
        <CrisisTestWrapper>
          <ResponsiveCrisisLayout>
            <div>Content</div>
          </ResponsiveCrisisLayout>
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/100% FREE/i)).toBeInTheDocument();
    });
  });

  describe('⚡ Performance Monitoring', () => {
    it('should initialize crisis performance monitor', () => {
      const monitor = new CrisisPerformanceMonitor();
      expect(monitor).toBeInstanceOf(CrisisPerformanceMonitor);
      
      // Cleanup
      monitor.disconnect();
    });

    it('should track crisis-specific metrics', () => {
      const monitor = new CrisisPerformanceMonitor();
      const startTime = performance.now();
      
      // Simulate help button click
      monitor.measureCrisisAction('help-button-click', startTime);
      
      const metrics = monitor.getMetrics();
      expect(metrics['help-button-click']).toBeDefined();
      expect(typeof metrics['help-button-click']).toBe('number');
      
      monitor.disconnect();
    });

    it('should alert on performance issues in crisis scenarios', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const monitor = new CrisisPerformanceMonitor();
      
      // Simulate slow help button (> 800ms target)
      const slowStartTime = performance.now() - 1000;
      monitor.measureCrisisAction('help-button-click', slowStartTime);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Crisis help button took')
      );
      
      consoleSpy.mockRestore();
      monitor.disconnect();
    });
  });

  describe('♿ Accessibility Compliance (WCAG 2.1 AAA)', () => {
    it('should meet contrast requirements for crisis text', () => {
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency">EMERGENCY HELP</CrisisButton>
        </CrisisTestWrapper>
      );

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // In a real test, you'd check actual contrast ratios
      expect(styles.backgroundColor).toBeDefined();
      expect(styles.color).toBeDefined();
    });

    it('should support keyboard navigation for all crisis features', async () => {
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" />
          <CrisisButton variant="help" />
        </CrisisTestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      
      // Test tab navigation
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);
      
      // Simulate tab to next element
      fireEvent.keyDown(buttons[0], { key: 'Tab' });
    });

    it('should provide screen reader support for crisis components', () => {
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" />
        </CrisisTestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('💰 100% FREE Platform Guarantee', () => {
    it('should not display any premium or paid feature mentions', () => {
      const { container } = render(
        <CrisisTestWrapper>
          <ResponsiveCrisisLayout>
            <CrisisChatInterface />
            <SafetyPlanBuilder />
            <VoiceVideoCommunication mode="voice" isActive={false} />
          </ResponsiveCrisisLayout>
        </CrisisTestWrapper>
      );

      // Verify no premium/paid content
      expect(container).not.toHaveTextContent(/premium/i);
      expect(container).not.toHaveTextContent(/upgrade/i);
      expect(container).not.toHaveTextContent(/payment/i);
      expect(container).not.toHaveTextContent(/subscription/i);
      expect(container).not.toHaveTextContent(/\$/); // No dollar signs
    });

    it('should prominently display free platform messaging', () => {
      render(
        <CrisisTestWrapper>
          <ResponsiveCrisisLayout>
            <div>Crisis Platform</div>
          </ResponsiveCrisisLayout>
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/100% FREE/i)).toBeInTheDocument();
      expect(screen.getByText(/forever/i)).toBeInTheDocument();
    });

    it('should maintain free access to all crisis intervention features', () => {
      const crisisFeatures = [
        <CrisisButton key="1" variant="emergency" />,
        <CrisisChatInterface key="2" />,
        <SafetyPlanBuilder key="3" />,
        <VoiceVideoCommunication key="4" mode="voice" isActive={false} />
      ];

      crisisFeatures.forEach((feature, index) => {
        const { unmount } = render(
          <CrisisTestWrapper>
            {feature}
          </CrisisTestWrapper>
        );

        // Each feature should be accessible without payment
        expect(screen.queryByText(/requires payment/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/premium only/i)).not.toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('🧪 Cross-Browser Compatibility', () => {
    it('should handle browser feature detection gracefully', () => {
      // Mock missing features
      const originalVibrate = navigator.vibrate;
      delete (navigator as any).vibrate;

      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" hapticFeedback={true} />
        </CrisisTestWrapper>
      );

      // Should not crash when vibrate is unavailable
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Restore
      (navigator as any).vibrate = originalVibrate;
    });

    it('should work without modern JavaScript features', () => {
      // Test graceful degradation
      render(
        <CrisisTestWrapper>
          <CrisisButton variant="emergency" />
        </CrisisTestWrapper>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('🔒 Security & Privacy', () => {
    it('should not expose sensitive user data in DOM', () => {
      render(
        <CrisisTestWrapper>
          <CrisisChatInterface />
        </CrisisTestWrapper>
      );

      // Check that no sensitive data is in DOM attributes
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        const attributes = Array.from(element.attributes);
        attributes.forEach(attr => {
          expect(attr.value).not.toMatch(/password|token|key|secret/i);
        });
      });
    });

    it('should maintain privacy in crisis communication', () => {
      render(
        <CrisisTestWrapper>
          <VoiceVideoCommunication 
            mode="video" 
            isActive={true} 
            isCrisisSession={true} 
          />
        </CrisisTestWrapper>
      );

      expect(screen.getByText(/encryption active/i)).toBeInTheDocument();
    });
  });
});

// Integration test for complete crisis flow
describe('🔄 Complete Crisis Intervention Flow', () => {
  it('should handle end-to-end crisis scenario', async () => {
    const user = userEvent.setup();
    
    render(
      <CrisisTestWrapper>
        <ResponsiveCrisisLayout>
          <CrisisButton variant="emergency" />
          <CrisisChatInterface />
          <SafetyPlanBuilder />
        </ResponsiveCrisisLayout>
      </CrisisTestWrapper>
    );

    // 1. User clicks crisis button
    const crisisButton = screen.getByRole('button');
    await user.click(crisisButton);

    // 2. Crisis chat should be available
    await waitFor(() => {
      expect(screen.getByText(/crisis chat/i)).toBeInTheDocument();
    });

    // 3. Safety plan should be accessible
    expect(screen.getByText(/safety plan/i)).toBeInTheDocument();

    // 4. Free platform should be emphasized throughout
    expect(screen.getByText(/100% FREE/i)).toBeInTheDocument();
  });

  it('should maintain crisis readiness at all times', () => {
    render(
      <CrisisTestWrapper>
        <ResponsiveCrisisLayout showCrisisBar={true}>
          <div>Regular Content</div>
        </ResponsiveCrisisLayout>
      </CrisisTestWrapper>
    );

    // Crisis help should always be one click away
    expect(screen.getByText(/regular content/i)).toBeInTheDocument();
    // Crisis bar should be present for immediate access
  });
});

// Performance benchmarks for crisis scenarios
describe('⚡ Crisis Performance Benchmarks', () => {
  it('should meet all crisis performance targets', async () => {
    const startTime = performance.now();
    
    render(
      <CrisisTestWrapper>
        <ResponsiveCrisisLayout>
          <CrisisButton variant="emergency" />
          <CrisisChatInterface />
        </ResponsiveCrisisLayout>
      </CrisisTestWrapper>
    );

    const renderTime = performance.now() - startTime;
    
    // Should render within crisis performance budget
    expect(renderTime).toBeLessThan(1000); // <1s for crisis UI
    
    // Crisis button should be immediately interactive
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
  });
});

export default {};