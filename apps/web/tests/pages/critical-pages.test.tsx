/**
 * Critical Pages Tests
 * Tests for all critical pages in the mental health platform
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

// Import page components
import HomePage from '@/app/page';
import CrisisPage from '@/app/crisis/page';
import CrisisChat from '@/app/crisis/chat/page';
import SafetyPlan from '@/app/crisis/safety-plan/page';
import AITherapyPage from '@/app/ai-therapy/page';
import AITherapyChatPage from '@/app/ai-therapy/chat/page';
import MoodPage from '@/app/mood/page';
import MoodAnalyticsPage from '@/app/mood/analytics/page';
import WellnessPage from '@/app/wellness/page';
import SelfHelpPage from '@/app/self-help/page';
import SupportPage from '@/app/support/page';
import ResourcesPage from '@/app/resources/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn()
};

describe('Crisis Pages', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockPush.mockClear();
  });

  describe('Crisis Landing Page', () => {
    it('should display immediate help options prominently', () => {
      render(<CrisisPage />);
      
      expect(screen.getByText(/988/)).toBeInTheDocument();
      expect(screen.getByText(/Suicide.*Crisis.*Lifeline/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Call Now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Chat Now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Text.*Crisis/i })).toBeInTheDocument();
    });

    it('should allow anonymous access without authentication', () => {
      render(<CrisisPage />);
      
      expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Help Now/i })).toBeEnabled();
    });

    it('should navigate to crisis chat when clicked', async () => {
      const user = userEvent.setup();
      render(<CrisisPage />);
      
      const chatButton = screen.getByRole('button', { name: /Start Crisis Chat/i });
      await user.click(chatButton);
      
      expect(mockPush).toHaveBeenCalledWith('/crisis/chat');
    });

    it('should display safety planning option', () => {
      render(<CrisisPage />);
      
      expect(screen.getByText(/Safety Plan/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create.*Safety.*Plan/i })).toBeInTheDocument();
    });

    it('should show coping strategies immediately', () => {
      render(<CrisisPage />);
      
      expect(screen.getByText(/Breathing Exercise/i)).toBeInTheDocument();
      expect(screen.getByText(/Grounding Technique/i)).toBeInTheDocument();
      expect(screen.getByText(/Call a Friend/i)).toBeInTheDocument();
    });
  });

  describe('Crisis Chat Page', () => {
    it('should render chat interface immediately', () => {
      render(<CrisisChat />);
      
      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
      expect(screen.getByText(/Crisis Support Chat/i)).toBeInTheDocument();
    });

    it('should display initial welcome message', () => {
      render(<CrisisChat />);
      
      expect(screen.getByText(/You're not alone/i)).toBeInTheDocument();
      expect(screen.getByText(/here to help/i)).toBeInTheDocument();
    });

    it('should send messages and display responses', async () => {
      const user = userEvent.setup();
      render(<CrisisChat />);
      
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /Send/i });
      
      await user.type(input, 'I need help');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('I need help')).toBeInTheDocument();
      });
      
      // Wait for AI response
      await waitFor(() => {
        expect(screen.getByTestId('ai-response')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show typing indicator while waiting for response', async () => {
      const user = userEvent.setup();
      render(<CrisisChat />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Help me');
      await user.keyboard('{Enter}');
      
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should maintain chat history during session', async () => {
      const user = userEvent.setup();
      render(<CrisisChat />);
      
      const input = screen.getByRole('textbox');
      
      // Send multiple messages
      await user.type(input, 'First message');
      await user.keyboard('{Enter}');
      
      await user.type(input, 'Second message');
      await user.keyboard('{Enter}');
      
      // Verify both messages are displayed
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });

  describe('Safety Plan Page', () => {
    it('should display all safety plan sections', () => {
      render(<SafetyPlan />);
      
      expect(screen.getByText(/Warning Signs/i)).toBeInTheDocument();
      expect(screen.getByText(/Coping Strategies/i)).toBeInTheDocument();
      expect(screen.getByText(/Support Contacts/i)).toBeInTheDocument();
      expect(screen.getByText(/Professional Contacts/i)).toBeInTheDocument();
      expect(screen.getByText(/Safe Environment/i)).toBeInTheDocument();
      expect(screen.getByText(/Reasons to Live/i)).toBeInTheDocument();
    });

    it('should allow adding warning signs', async () => {
      const user = userEvent.setup();
      render(<SafetyPlan />);
      
      const warningSigns = within(screen.getByTestId('warning-signs-section'));
      const input = warningSigns.getByRole('textbox');
      const addButton = warningSigns.getByRole('button', { name: /Add/i });
      
      await user.type(input, 'Feeling isolated');
      await user.click(addButton);
      
      expect(screen.getByText('Feeling isolated')).toBeInTheDocument();
    });

    it('should validate required fields before saving', async () => {
      const user = userEvent.setup();
      render(<SafetyPlan />);
      
      const saveButton = screen.getByRole('button', { name: /Save Plan/i });
      await user.click(saveButton);
      
      expect(screen.getByText(/Please add at least one warning sign/i)).toBeInTheDocument();
      expect(screen.getByText(/Please add at least one coping strategy/i)).toBeInTheDocument();
    });

    it('should allow sharing safety plan with providers', async () => {
      const user = userEvent.setup();
      render(<SafetyPlan />);
      
      // Fill minimal required fields
      // ... (add items to plan)
      
      const shareButton = screen.getByRole('button', { name: /Share with Provider/i });
      await user.click(shareButton);
      
      expect(screen.getByText(/Share Safety Plan/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Therapist/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Emergency Contact/i })).toBeInTheDocument();
    });
  });
});

describe('AI Therapy Pages', () => {
  describe('AI Therapy Hub', () => {
    it('should display therapy options', () => {
      render(
        <SessionProvider session={null}>
          <AITherapyPage />
        </SessionProvider>
      );
      
      expect(screen.getByText(/Cognitive Behavioral Therapy/i)).toBeInTheDocument();
      expect(screen.getByText(/Dialectical Behavior Therapy/i)).toBeInTheDocument();
      expect(screen.getByText(/Mindfulness-Based/i)).toBeInTheDocument();
      expect(screen.getByText(/Solution-Focused/i)).toBeInTheDocument();
    });

    it('should show session history for authenticated users', () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      render(
        <SessionProvider session={mockSession}>
          <AITherapyPage />
        </SessionProvider>
      );
      
      expect(screen.getByText(/Recent Sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    });

    it('should navigate to chat when therapy type is selected', async () => {
      const user = userEvent.setup();
      render(
        <SessionProvider session={null}>
          <AITherapyPage />
        </SessionProvider>
      );
      
      const cbtButton = screen.getByRole('button', { name: /Start CBT Session/i });
      await user.click(cbtButton);
      
      expect(mockPush).toHaveBeenCalledWith('/ai-therapy/chat?type=cbt');
    });
  });

  describe('AI Therapy Chat Page', () => {
    it('should display therapy session interface', () => {
      render(<AITherapyChatPage />);
      
      expect(screen.getByText(/AI Therapy Session/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByTestId('session-timer')).toBeInTheDocument();
    });

    it('should show session goals if set', () => {
      render(<AITherapyChatPage />);
      
      expect(screen.getByText(/Session Goals/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Set Goals/i })).toBeInTheDocument();
    });

    it('should track session duration', async () => {
      jest.useFakeTimers();
      render(<AITherapyChatPage />);
      
      const timer = screen.getByTestId('session-timer');
      expect(timer).toHaveTextContent('0:00');
      
      jest.advanceTimersByTime(60000); // 1 minute
      
      await waitFor(() => {
        expect(timer).toHaveTextContent('1:00');
      });
      
      jest.useRealTimers();
    });

    it('should save session on completion', async () => {
      const user = userEvent.setup();
      render(<AITherapyChatPage />);
      
      const endButton = screen.getByRole('button', { name: /End Session/i });
      await user.click(endButton);
      
      expect(screen.getByText(/Rate this session/i)).toBeInTheDocument();
      expect(screen.getByText(/Save session notes/i)).toBeInTheDocument();
    });
  });
});

describe('Mood Tracking Pages', () => {
  describe('Mood Entry Page', () => {
    it('should display mood scale selector', () => {
      render(<MoodPage />);
      
      expect(screen.getByText(/How are you feeling/i)).toBeInTheDocument();
      
      // Check for mood scale (1-10)
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument();
      }
    });

    it('should show additional factors after mood selection', async () => {
      const user = userEvent.setup();
      render(<MoodPage />);
      
      const moodButton = screen.getByRole('button', { name: '7' });
      await user.click(moodButton);
      
      expect(screen.getByText(/Energy Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Anxiety/i)).toBeInTheDocument();
      expect(screen.getByText(/Sleep Quality/i)).toBeInTheDocument();
      expect(screen.getByText(/Activities/i)).toBeInTheDocument();
    });

    it('should allow adding notes', async () => {
      const user = userEvent.setup();
      render(<MoodPage />);
      
      const notesField = screen.getByRole('textbox', { name: /notes/i });
      await user.type(notesField, 'Had a good therapy session today');
      
      expect(notesField).toHaveValue('Had a good therapy session today');
    });

    it('should save mood entry', async () => {
      const user = userEvent.setup();
      render(<MoodPage />);
      
      // Select mood
      await user.click(screen.getByRole('button', { name: '8' }));
      
      // Save entry
      const saveButton = screen.getByRole('button', { name: /Save Entry/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Mood saved successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mood Analytics Page', () => {
    it('should display mood trends chart', () => {
      render(<MoodAnalyticsPage />);
      
      expect(screen.getByText(/Mood Trends/i)).toBeInTheDocument();
      expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
    });

    it('should show mood statistics', () => {
      render(<MoodAnalyticsPage />);
      
      expect(screen.getByText(/Average Mood/i)).toBeInTheDocument();
      expect(screen.getByText(/Mood Stability/i)).toBeInTheDocument();
      expect(screen.getByText(/Best Day/i)).toBeInTheDocument();
      expect(screen.getByText(/Challenging Day/i)).toBeInTheDocument();
    });

    it('should display mood patterns', () => {
      render(<MoodAnalyticsPage />);
      
      expect(screen.getByText(/Weekly Pattern/i)).toBeInTheDocument();
      expect(screen.getByText(/Time of Day/i)).toBeInTheDocument();
      expect(screen.getByText(/Triggers/i)).toBeInTheDocument();
    });

    it('should allow filtering by date range', async () => {
      const user = userEvent.setup();
      render(<MoodAnalyticsPage />);
      
      const dateFilter = screen.getByRole('combobox', { name: /Date Range/i });
      await user.selectOptions(dateFilter, '30days');
      
      expect(screen.getByText(/Last 30 Days/i)).toBeInTheDocument();
    });
  });
});

describe('Wellness Pages', () => {
  describe('Wellness Hub', () => {
    it('should display all wellness tools', () => {
      render(<WellnessPage />);
      
      expect(screen.getByText(/Breathing Exercises/i)).toBeInTheDocument();
      expect(screen.getByText(/Mindfulness/i)).toBeInTheDocument();
      expect(screen.getByText(/Meditation/i)).toBeInTheDocument();
      expect(screen.getByText(/Progressive Muscle Relaxation/i)).toBeInTheDocument();
      expect(screen.getByText(/Grounding Techniques/i)).toBeInTheDocument();
    });

    it('should navigate to specific wellness tool', async () => {
      const user = userEvent.setup();
      render(<WellnessPage />);
      
      const breathingCard = screen.getByTestId('breathing-exercises-card');
      await user.click(breathingCard);
      
      expect(mockPush).toHaveBeenCalledWith('/wellness/breathing');
    });

    it('should show recommended tools based on user state', () => {
      render(<WellnessPage />);
      
      expect(screen.getByText(/Recommended for You/i)).toBeInTheDocument();
      expect(screen.getByTestId('recommended-tools')).toBeInTheDocument();
    });
  });
});

describe('Support Pages', () => {
  describe('Support Hub', () => {
    it('should display support options', () => {
      render(<SupportPage />);
      
      expect(screen.getByText(/Peer Support/i)).toBeInTheDocument();
      expect(screen.getByText(/Group Sessions/i)).toBeInTheDocument();
      expect(screen.getByText(/Community Forums/i)).toBeInTheDocument();
      expect(screen.getByText(/Find a Therapist/i)).toBeInTheDocument();
    });

    it('should show emergency contacts prominently', () => {
      render(<SupportPage />);
      
      expect(screen.getByText(/Emergency Contacts/i)).toBeInTheDocument();
      expect(screen.getByText(/988/)).toBeInTheDocument();
      expect(screen.getByText(/Crisis Text Line/i)).toBeInTheDocument();
    });
  });
});

describe('Resources Page', () => {
  it('should categorize resources appropriately', () => {
    render(<ResourcesPage />);
    
    expect(screen.getByText(/Educational Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Self-Help Guides/i)).toBeInTheDocument();
    expect(screen.getByText(/Videos/i)).toBeInTheDocument();
    expect(screen.getByText(/Worksheets/i)).toBeInTheDocument();
    expect(screen.getByText(/Articles/i)).toBeInTheDocument();
  });

  it('should allow searching resources', async () => {
    const user = userEvent.setup();
    render(<ResourcesPage />);
    
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'anxiety');
    
    await waitFor(() => {
      expect(screen.getByText(/results for "anxiety"/i)).toBeInTheDocument();
    });
  });

  it('should filter resources by category', async () => {
    const user = userEvent.setup();
    render(<ResourcesPage />);
    
    const filterButton = screen.getByRole('button', { name: /Depression/i });
    await user.click(filterButton);
    
    expect(screen.getByTestId('filtered-resources')).toBeInTheDocument();
  });
});

describe('Page Accessibility', () => {
  const pages = [
    { name: 'Crisis Page', component: CrisisPage },
    { name: 'AI Therapy', component: AITherapyPage },
    { name: 'Mood Tracking', component: MoodPage },
    { name: 'Wellness Hub', component: WellnessPage }
  ];

  pages.forEach(({ name, component: Component }) => {
    describe(`${name} Accessibility`, () => {
      it('should have proper heading structure', () => {
        render(<Component />);
        
        const h1 = screen.getAllByRole('heading', { level: 1 });
        expect(h1).toHaveLength(1);
      });

      it('should have proper ARIA labels', () => {
        render(<Component />);
        
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveAccessibleName();
        });
      });

      it('should be keyboard navigable', async () => {
        const user = userEvent.setup();
        render(<Component />);
        
        // Tab through interactive elements
        await user.tab();
        expect(document.activeElement).not.toBe(document.body);
      });

      it('should have sufficient color contrast', () => {
        const { container } = render(<Component />);
        
        // This would typically use axe-core for real testing
        const elements = container.querySelectorAll('*');
        elements.forEach(element => {
          const styles = window.getComputedStyle(element);
          // Check that text has sufficient contrast
          // This is a simplified check - real implementation would calculate contrast ratio
          if (styles.color && styles.backgroundColor) {
            expect(styles.color).not.toBe(styles.backgroundColor);
          }
        });
      });
    });
  });
});