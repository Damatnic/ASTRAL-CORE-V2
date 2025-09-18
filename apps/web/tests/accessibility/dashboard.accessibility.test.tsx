/**
 * ASTRAL_CORE V2.0 - Crisis Intervention Dashboard Accessibility Tests
 * 
 * WCAG 2.1 AA Compliance Testing for Crisis Management Dashboard
 * Phase 4 Testing: Complex Interface Accessibility
 * 
 * Critical Requirements:
 * - Real-time dashboard must be accessible to volunteers with disabilities
 * - Crisis alerts must be properly announced to screen readers
 * - Complex data tables must support screen reader navigation
 * - Emergency escalation controls must be keyboard accessible
 * - Dashboard filtering and search must be accessible
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import CrisisInterventionDashboard from '../../src/components/crisis/CrisisInterventionDashboard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock audio for alert notifications
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
  })),
});

describe('Crisis Intervention Dashboard - WCAG 2.1 AA Accessibility Compliance', () => {

  describe('Dashboard Header Accessibility', () => {
    test('should have accessible header with proper landmark roles', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/crisis intervention dashboard/i)).toBeInTheDocument();
      });
      
      // Main header should be a banner landmark
      const header = container.querySelector('header') || 
                    screen.getByText(/crisis intervention dashboard/i).closest('[class*="border-b"]');
      
      expect(header).toHaveAttribute('role', 'banner');
      expect(header).toHaveAttribute('aria-label', expect.stringMatching(/crisis.*intervention.*dashboard/i));
      
      // Page title should be proper heading
      const pageTitle = screen.getByRole('heading', { level: 1 });
      expect(pageTitle).toHaveTextContent(/crisis intervention dashboard/i);
      
      const results = await axe(header as HTMLElement);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible connection status indicator', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const connectionStatus = screen.getByText(/live/i);
        expect(connectionStatus).toBeInTheDocument();
        
        // Connection status should be announced to screen readers
        const statusContainer = connectionStatus.closest('[class*="flex items-center"]');
        expect(statusContainer).toHaveAttribute('aria-live', 'polite');
        expect(statusContainer).toHaveAttribute('aria-label', expect.stringMatching(/connection.*status/i));
        
        // WiFi icon should be decorative
        const wifiIcon = statusContainer?.querySelector('svg');
        if (wifiIcon) {
          expect(wifiIcon).toHaveAttribute('aria-hidden', 'true');
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible auto-refresh toggle', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const autoRefreshToggle = screen.getByRole('button', { name: /auto.*refresh/i });
        expect(autoRefreshToggle).toBeInTheDocument();
        
        // Toggle should indicate current state
        expect(autoRefreshToggle).toHaveAttribute('aria-pressed');
        expect(autoRefreshToggle).toHaveAttribute('aria-label', expect.stringMatching(/auto.*refresh/i));
        
        // Test keyboard activation
        autoRefreshToggle.focus();
        expect(document.activeElement).toBe(autoRefreshToggle);
        
        // Test space key activation
        fireEvent.keyDown(autoRefreshToggle, { key: ' ', code: 'Space' });
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Alert System Accessibility', () => {
    test('should have accessible crisis alerts with proper ARIA live regions', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const alertsBar = container.querySelector('[class*="bg-red-50"]');
        if (alertsBar) {
          // Alerts should be announced immediately
          expect(alertsBar).toHaveAttribute('role', 'alert');
          expect(alertsBar).toHaveAttribute('aria-live', 'assertive');
          expect(alertsBar).toHaveAttribute('aria-atomic', 'true');
          
          // Alert count should be accessible
          const alertCount = screen.queryByText(/\d+.*active alerts/i);
          if (alertCount) {
            expect(alertCount).toHaveAttribute('aria-label', expect.stringMatching(/\d+.*critical.*alerts?/i));
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible alert dismissal buttons', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const alertDismissButtons = container.querySelectorAll('[role="alert"] button');
        
        alertDismissButtons.forEach((button) => {
          expect(button).toHaveAttribute('aria-label', expect.stringMatching(/dismiss|acknowledge|close/i));
          expect(button).toHaveAttribute('type', 'button');
          
          // Touch target should be adequate
          const rect = button.getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
        });
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Metrics Overview Accessibility', () => {
    test('should have accessible metrics with proper data presentation', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const metricsSection = container.querySelector('[class*="grid-cols-2"]') ||
                              container.querySelector('[class*="grid-cols-4"]');
        
        if (metricsSection) {
          expect(metricsSection).toHaveAttribute('role', 'region');
          expect(metricsSection).toHaveAttribute('aria-labelledby');
          
          // Find metrics cards
          const metricCards = metricsSection.querySelectorAll('[class*="text-center"]');
          
          metricCards.forEach((card) => {
            // Each metric should have descriptive labels
            const value = card.querySelector('[class*="text-2xl"]');
            const label = card.querySelector('[class*="text-sm"]');
            
            if (value && label) {
              expect(card).toHaveAttribute('aria-label', 
                expect.stringMatching(new RegExp(`${value.textContent}.*${label.textContent}`, 'i'))
              );
            }
          });
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should announce critical metric changes to screen readers', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        // Critical metrics should have live regions
        const criticalMetric = screen.queryByText(/critical/i)?.closest('[class*="text-center"]');
        if (criticalMetric) {
          expect(criticalMetric).toHaveAttribute('aria-live', 'assertive');
          
          // High-priority metrics should be clearly identified
          const criticalValue = criticalMetric.querySelector('[class*="text-red-600"]');
          if (criticalValue) {
            expect(criticalValue).toHaveAttribute('aria-label', expect.stringMatching(/critical.*cases/i));
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Sessions List Accessibility', () => {
    test('should have accessible session filters and search', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        // Search input should be properly labeled
        const searchInput = screen.queryByPlaceholderText(/search sessions/i);
        if (searchInput) {
          expect(searchInput).toHaveAttribute('aria-label', expect.stringMatching(/search.*sessions/i));
          expect(searchInput).toHaveAttribute('role', 'searchbox');
          
          // Search icon should be decorative
          const searchIcon = searchInput.closest('div')?.querySelector('svg');
          if (searchIcon) {
            expect(searchIcon).toHaveAttribute('aria-hidden', 'true');
          }
        }
        
        // Filter dropdowns should be accessible
        const severityFilter = screen.queryByDisplayValue(/all severities/i);
        const statusFilter = screen.queryByDisplayValue(/all status/i);
        
        [severityFilter, statusFilter].forEach((filter) => {
          if (filter) {
            expect(filter).toHaveAttribute('aria-label');
            expect(filter).toHaveAttribute('role', 'combobox');
          }
        });
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible session list with proper navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const sessionsList = container.querySelector('[class*="space-y-3"]');
        if (sessionsList) {
          expect(sessionsList).toHaveAttribute('role', 'list');
          expect(sessionsList).toHaveAttribute('aria-label', expect.stringMatching(/crisis.*sessions/i));
          
          // Each session should be a list item
          const sessionItems = sessionsList.querySelectorAll('[class*="p-4"][class*="border"]');
          
          sessionItems.forEach((session, index) => {
            expect(session).toHaveAttribute('role', 'listitem');
            expect(session).toHaveAttribute('tabindex', '0');
            expect(session).toHaveAttribute('aria-label', expect.stringMatching(/session|user/i));
            
            // Session severity should be indicated
            const severityBadge = session.querySelector('[class*="bg-red-100"], [class*="bg-orange-100"], [class*="bg-yellow-100"], [class*="bg-green-100"]');
            if (severityBadge) {
              expect(severityBadge).toHaveAttribute('aria-label', expect.stringMatching(/severity.*level/i));
            }
            
            // Session status should be accessible
            const statusIndicator = session.querySelector('[class*="animate-pulse"], [class*="w-2 h-2"]');
            if (statusIndicator) {
              expect(statusIndicator).toHaveAttribute('aria-label', expect.stringMatching(/status|active|waiting/i));
            }
          });
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should support keyboard navigation through sessions', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const sessionItems = container.querySelectorAll('[role="listitem"]');
        
        if (sessionItems.length > 0) {
          // Test arrow key navigation
          const firstSession = sessionItems[0] as HTMLElement;
          firstSession.focus();
          expect(document.activeElement).toBe(firstSession);
          
          // Test Enter key selection
          const mockClick = jest.fn();
          firstSession.addEventListener('click', mockClick);
          fireEvent.keyDown(firstSession, { key: 'Enter', code: 'Enter' });
          
          // Should support Home/End keys for navigation
          fireEvent.keyDown(firstSession, { key: 'Home' });
          expect(document.activeElement).toBe(sessionItems[0]);
          
          if (sessionItems.length > 1) {
            fireEvent.keyDown(firstSession, { key: 'End' });
            expect(document.activeElement).toBe(sessionItems[sessionItems.length - 1]);
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Session Details Panel Accessibility', () => {
    test('should have accessible session details with proper structure', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        // Click on a session to open details
        const firstSession = container.querySelector('[role="listitem"]');
        if (firstSession) {
          fireEvent.click(firstSession);
          
          // Details panel should appear
          const detailsPanel = container.querySelector('[class*="w-96"]');
          if (detailsPanel) {
            expect(detailsPanel).toHaveAttribute('role', 'region');
            expect(detailsPanel).toHaveAttribute('aria-labelledby');
            
            // Session details should be in a definition list
            const sessionDetails = detailsPanel.querySelector('[class*="space-y-2"]');
            if (sessionDetails) {
              expect(sessionDetails).toHaveAttribute('role', 'list');
              
              // Each detail should be properly structured
              const detailItems = sessionDetails.querySelectorAll('[class*="flex items-center justify-between"]');
              detailItems.forEach((item) => {
                expect(item).toHaveAttribute('role', 'listitem');
              });
            }
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible risk assessment display', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const firstSession = container.querySelector('[role="listitem"]');
        if (firstSession) {
          fireEvent.click(firstSession);
          
          // Risk assessment section should be accessible
          const riskSection = screen.queryByText(/risk assessment/i)?.closest('[class*="px-6 py-4"]');
          if (riskSection) {
            expect(riskSection).toHaveAttribute('role', 'region');
            expect(riskSection).toHaveAttribute('aria-labelledby');
            
            // Severity level should be announced
            const severityLevel = riskSection.querySelector('[class*="bg-red-50"], [class*="bg-orange-50"], [class*="bg-yellow-50"], [class*="bg-green-50"]');
            if (severityLevel) {
              expect(severityLevel).toHaveAttribute('aria-live', 'polite');
              expect(severityLevel).toHaveAttribute('aria-label', expect.stringMatching(/severity.*level/i));
            }
            
            // Risk factors should be listed accessibly
            const riskFactors = riskSection.querySelectorAll('[class*="flex items-center space-x-2"]');
            riskFactors.forEach((factor) => {
              expect(factor).toHaveAttribute('role', 'listitem');
            });
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible action buttons with proper states', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const firstSession = container.querySelector('[role="listitem"]');
        if (firstSession) {
          fireEvent.click(firstSession);
          
          // Action buttons should be accessible
          const actionButtons = container.querySelectorAll('[class*="grid-cols-2"] button');
          
          actionButtons.forEach((button) => {
            expect(button).toHaveAttribute('aria-label');
            expect(button).not.toHaveAttribute('aria-disabled', 'true');
            
            // Icons should be accompanied by text or proper labels
            const icon = button.querySelector('svg');
            if (icon) {
              expect(icon).toHaveAttribute('aria-hidden', 'true');
            }
            
            // Touch targets should be adequate
            const rect = button.getBoundingClientRect();
            expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
          });
          
          // Escalate button should have special attention
          const escalateButton = screen.queryByRole('button', { name: /escalate/i });
          if (escalateButton) {
            expect(escalateButton).toHaveAttribute('aria-describedby');
            expect(escalateButton).toHaveClass(expect.stringMatching(/red/)); // Warning color
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Volunteer Assignment Accessibility', () => {
    test('should have accessible volunteer list with proper selection', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const firstSession = container.querySelector('[role="listitem"]');
        if (firstSession) {
          fireEvent.click(firstSession);
          
          // Available volunteers section
          const volunteersSection = screen.queryByText(/available volunteers/i)?.closest('[class*="px-6 py-4"]');
          if (volunteersSection) {
            expect(volunteersSection).toHaveAttribute('role', 'region');
            expect(volunteersSection).toHaveAttribute('aria-labelledby');
            
            // Volunteer cards should be selectable
            const volunteerCards = volunteersSection.querySelectorAll('[class*="p-3"][class*="border"]');
            
            volunteerCards.forEach((card) => {
              expect(card).toHaveAttribute('role', 'button');
              expect(card).toHaveAttribute('tabindex', '0');
              expect(card).toHaveAttribute('aria-label', expect.stringMatching(/volunteer|counselor/i));
              
              // Volunteer rating should be accessible
              const ratingStars = card.querySelectorAll('[class*="text-red-500"]');
              if (ratingStars.length > 0) {
                const ratingContainer = ratingStars[0].closest('div');
                expect(ratingContainer).toHaveAttribute('aria-label', expect.stringMatching(/rating.*\d/i));
              }
            });
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('View Toggle Accessibility', () => {
    test('should have accessible grid/list view toggle', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const viewToggleButtons = container.querySelectorAll('[class*="p-1.5 rounded"]');
        
        if (viewToggleButtons.length >= 2) {
          const gridViewButton = viewToggleButtons[0] as HTMLElement;
          const listViewButton = viewToggleButtons[1] as HTMLElement;
          
          // View toggle buttons should be properly labeled
          expect(gridViewButton).toHaveAttribute('aria-label', expect.stringMatching(/grid.*view/i));
          expect(listViewButton).toHaveAttribute('aria-label', expect.stringMatching(/list.*view/i));
          
          // Should indicate current state
          expect(gridViewButton).toHaveAttribute('aria-pressed');
          expect(listViewButton).toHaveAttribute('aria-pressed');
          
          // Test keyboard activation
          gridViewButton.focus();
          expect(document.activeElement).toBe(gridViewButton);
          
          fireEvent.keyDown(gridViewButton, { key: 'Enter', code: 'Enter' });
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('System Status Bar Accessibility', () => {
    test('should have accessible system status information', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        const statusBar = container.querySelector('.bg-gray-900');
        if (statusBar) {
          expect(statusBar).toHaveAttribute('role', 'contentinfo');
          expect(statusBar).toHaveAttribute('aria-label', expect.stringMatching(/system.*status/i));
          
          // Status information should be properly structured
          const statusItems = statusBar.querySelectorAll('span');
          statusItems.forEach((item) => {
            if (item.textContent?.includes('Status:')) {
              expect(item).toHaveAttribute('aria-label', expect.stringMatching(/system.*status.*operational/i));
            }
            if (item.textContent?.includes('Response Time:')) {
              expect(item).toHaveAttribute('aria-label', expect.stringMatching(/response.*time/i));
            }
          });
          
          // Last updated should be announced
          const lastUpdated = statusBar.querySelector('[class*="text-gray-400"]');
          if (lastUpdated) {
            expect(lastUpdated).toHaveAttribute('aria-live', 'polite');
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Dashboard Accessibility', () => {
    test('should maintain accessibility on mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        // All interactive elements should have adequate touch targets
        const interactiveElements = container.querySelectorAll(
          'button, [role="button"], input, select, [role="listitem"]'
        );
        
        interactiveElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
        });
        
        // Dashboard should not have horizontal scroll
        const body = document.body;
        expect(body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 20);
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should support mobile screen reader gestures', async () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      });
      
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        // Ensure proper heading navigation for mobile screen readers
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);
        
        // Ensure proper landmark navigation
        const landmarks = container.querySelectorAll(
          '[role="banner"], [role="main"], [role="navigation"], [role="region"], [role="contentinfo"]'
        );
        expect(landmarks.length).toBeGreaterThan(0);
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Real-time Updates Accessibility', () => {
    test('should handle real-time updates without disrupting screen readers', async () => {
      const { container } = render(<CrisisInterventionDashboard />);
      
      await waitFor(() => {
        // Live regions should be appropriately configured
        const liveRegions = container.querySelectorAll('[aria-live]');
        
        liveRegions.forEach((region) => {
          const ariaLive = region.getAttribute('aria-live');
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
          
          // Critical alerts should be assertive, others polite
          if (region.classList.contains('bg-red-50') || region.textContent?.includes('critical')) {
            expect(ariaLive).toBe('assertive');
          } else {
            expect(ariaLive).toBe('polite');
          }
        });
        
        // Auto-refresh should not interfere with focus
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== document.body) {
          // Simulate auto-refresh
          setTimeout(() => {
            expect(document.activeElement).toBe(focusedElement);
          }, 100);
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});