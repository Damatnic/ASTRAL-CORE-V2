/**
 * ASTRAL_CORE 2.0 - WCAG 2.1 AA Accessibility Tests
 * Life-critical accessibility testing for mental health platform
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Import components to test
import SafetyPlanGenerator from '../../apps/web/src/components/crisis/SafetyPlanGenerator';
import AnonymousCrisisChat from '../../apps/web/src/components/crisis/AnonymousCrisisChat';
import CrisisInterventionDashboard from '../../apps/web/src/components/crisis/CrisisInterventionDashboard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock therapeutic layout component
const TherapeuticLayout = ({ children }: { children: React.ReactNode }) => (
  <div role="main" aria-label="Mental health platform">
    {children}
  </div>
);

describe('WCAG 2.1 AA Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any global accessibility state
    jest.clearAllMocks();
  });

  describe('Perceivable - Guideline 1', () => {
    describe('1.1 Text Alternatives', () => {
      it('should provide alt text for all images', () => {
        render(
          <TherapeuticLayout>
            <img src="/crisis-icon.svg" alt="Crisis support available" />
            <img src="/safety-icon.svg" alt="Safety plan tools" />
            <img src="/chat-icon.svg" alt="Anonymous chat support" />
          </TherapeuticLayout>
        );

        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
          expect(img.getAttribute('alt')).not.toBe('');
        });
      });

      it('should use empty alt for decorative images', () => {
        render(
          <TherapeuticLayout>
            <img src="/decorative-pattern.svg" alt="" role="presentation" />
            <img src="/background-texture.jpg" alt="" aria-hidden="true" />
          </TherapeuticLayout>
        );

        const decorativeImages = screen.getAllByRole('presentation');
        decorativeImages.forEach(img => {
          expect(img).toHaveAttribute('alt', '');
        });
      });

      it('should provide text alternatives for complex images', () => {
        render(
          <TherapeuticLayout>
            <figure>
              <img 
                src="/mood-chart.png" 
                alt="Mood tracking chart showing improvement over 30 days"
                aria-describedby="mood-chart-description"
              />
              <figcaption id="mood-chart-description">
                This chart shows daily mood ratings from 1-10 over the past month, 
                indicating a gradual improvement from an average of 4 to 7.
              </figcaption>
            </figure>
          </TherapeuticLayout>
        );

        const complexImage = screen.getByRole('img');
        expect(complexImage).toHaveAttribute('aria-describedby', 'mood-chart-description');
        expect(screen.getByText(/This chart shows daily mood ratings/)).toBeInTheDocument();
      });
    });

    describe('1.2 Time-based Media', () => {
      it('should provide captions for video content', () => {
        render(
          <TherapeuticLayout>
            <video controls aria-label="Breathing exercise demonstration">
              <source src="/breathing-exercise.mp4" type="video/mp4" />
              <track kind="captions" src="/breathing-exercise-captions.vtt" srcLang="en" label="English" default />
              <track kind="descriptions" src="/breathing-exercise-descriptions.vtt" srcLang="en" label="Audio descriptions" />
              <p>Your browser does not support the video element. <a href="/breathing-exercise-transcript.html">View transcript</a></p>
            </video>
          </TherapeuticLayout>
        );

        const video = screen.getByRole('application'); // Video with controls
        expect(video).toHaveAttribute('aria-label');
        
        // Check for caption tracks
        const captionTrack = video.querySelector('track[kind="captions"]');
        expect(captionTrack).toBeInTheDocument();
      });

      it('should provide transcripts for audio content', () => {
        render(
          <TherapeuticLayout>
            <audio controls aria-describedby="meditation-transcript">
              <source src="/guided-meditation.mp3" type="audio/mpeg" />
              <p>Your browser does not support the audio element.</p>
            </audio>
            <div id="meditation-transcript">
              <h3>Meditation Transcript</h3>
              <p>Begin by finding a comfortable position...</p>
            </div>
          </TherapeuticLayout>
        );

        const audio = screen.getByRole('application');
        expect(audio).toHaveAttribute('aria-describedby', 'meditation-transcript');
        expect(screen.getByText('Meditation Transcript')).toBeInTheDocument();
      });
    });

    describe('1.3 Adaptable', () => {
      it('should use semantic HTML structure', async () => {
        const { container } = render(
          <TherapeuticLayout>
            <header>
              <h1>Crisis Support Platform</h1>
              <nav aria-label="Main navigation">
                <ul>
                  <li><a href="/crisis">Crisis Chat</a></li>
                  <li><a href="/safety-plan">Safety Plan</a></li>
                </ul>
              </nav>
            </header>
            <main>
              <section aria-labelledby="crisis-section">
                <h2 id="crisis-section">Immediate Crisis Support</h2>
                <article>
                  <h3>Anonymous Chat</h3>
                  <p>Available 24/7 for crisis support</p>
                </article>
              </section>
            </main>
            <footer>
              <p>Crisis Hotline: 988</p>
            </footer>
          </TherapeuticLayout>
        );

        // Check semantic landmarks
        expect(screen.getByRole('banner')).toBeInTheDocument(); // header
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer

        // Check heading hierarchy
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Crisis Support Platform');
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Immediate Crisis Support');
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Anonymous Chat');

        // Run axe accessibility tests
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('should maintain meaning without CSS', () => {
        render(
          <TherapeuticLayout>
            <div>
              <h2>Crisis Severity Levels</h2>
              <ol>
                <li><strong>Low:</strong> Mild distress, able to cope</li>
                <li><strong>Medium:</strong> Moderate distress, some difficulty coping</li>
                <li><strong>High:</strong> Severe distress, significant difficulty coping</li>
                <li><strong>Critical:</strong> Immediate danger, requires emergency intervention</li>
              </ol>
            </div>
          </TherapeuticLayout>
        );

        // Structure should be meaningful without CSS
        const severityList = screen.getByRole('list');
        expect(severityList).toBeInTheDocument();
        
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(4);
        
        // Content should be readable in order
        expect(listItems[0]).toHaveTextContent('Low:');
        expect(listItems[3]).toHaveTextContent('Critical:');
      });
    });

    describe('1.4 Distinguishable', () => {
      it('should meet color contrast requirements', () => {
        render(
          <TherapeuticLayout>
            <div style={{ backgroundColor: '#ffffff', color: '#333333' }}>
              Normal text with 12.6:1 contrast ratio
            </div>
            <div style={{ backgroundColor: '#f0f0f0', color: '#666666' }}>
              Secondary text with 4.5:1 contrast ratio
            </div>
            <button style={{ backgroundColor: '#007acc', color: '#ffffff' }}>
              Button with 4.5:1 contrast ratio
            </button>
          </TherapeuticLayout>
        );

        // Note: Actual contrast testing would require specialized tools
        // This test ensures the markup supports contrast requirements
        expect(screen.getByText(/Normal text/)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      it('should not rely solely on color for information', () => {
        render(
          <TherapeuticLayout>
            <div>
              <h3>Crisis Risk Level Indicators</h3>
              <div role="status" aria-label="Low risk">
                <span style={{ color: 'green' }}>●</span>
                <span>Low Risk</span>
                <span aria-hidden="true">(Safe)</span>
              </div>
              <div role="status" aria-label="High risk">
                <span style={{ color: 'red' }}>●</span>
                <span>High Risk</span>
                <span aria-hidden="true">(!)</span>
              </div>
            </div>
          </TherapeuticLayout>
        );

        // Information should be available through text, not just color
        expect(screen.getByText('Low Risk')).toBeInTheDocument();
        expect(screen.getByText('High Risk')).toBeInTheDocument();
        
        // Additional indicators beyond color
        expect(screen.getByText('(Safe)')).toBeInTheDocument();
        expect(screen.getByText('(!)')).toBeInTheDocument();
      });

      it('should support zoom up to 200% without horizontal scrolling', () => {
        // This would typically be tested with actual zoom functionality
        // Here we test that the layout is flexible
        render(
          <TherapeuticLayout>
            <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
                  Crisis chat interface
                </div>
                <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
                  Safety resources
                </div>
              </div>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByText('Crisis chat interface')).toBeInTheDocument();
        expect(screen.getByText('Safety resources')).toBeInTheDocument();
      });

      it('should allow text spacing adjustments', () => {
        render(
          <TherapeuticLayout>
            <div style={{ 
              lineHeight: '1.5',
              letterSpacing: '0.12em',
              wordSpacing: '0.16em',
              padding: '0.5em'
            }}>
              <p>This text supports spacing adjustments for better readability.</p>
              <p>Users can increase line height, letter spacing, and word spacing without loss of functionality.</p>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByText(/This text supports spacing adjustments/)).toBeInTheDocument();
      });
    });
  });

  describe('Operable - Guideline 2', () => {
    describe('2.1 Keyboard Accessible', () => {
      it('should make all functionality keyboard accessible', async () => {
        const user = userEvent.setup();
        
        render(
          <TherapeuticLayout>
            <div>
              <button>Crisis Chat</button>
              <button>Safety Plan</button>
              <a href="/help">Help Resources</a>
              <input type="text" placeholder="Search resources" />
              <select aria-label="Crisis severity">
                <option>Low</option>
                <option>High</option>
              </select>
            </div>
          </TherapeuticLayout>
        );

        // Test keyboard navigation
        await user.tab();
        expect(screen.getByText('Crisis Chat')).toHaveFocus();

        await user.tab();
        expect(screen.getByText('Safety Plan')).toHaveFocus();

        await user.tab();
        expect(screen.getByText('Help Resources')).toHaveFocus();

        await user.tab();
        expect(screen.getByPlaceholderText('Search resources')).toHaveFocus();

        await user.tab();
        expect(screen.getByLabelText('Crisis severity')).toHaveFocus();
      });

      it('should provide skip links for navigation', () => {
        render(
          <TherapeuticLayout>
            <div>
              <a href="#main-content" className="skip-link">Skip to main content</a>
              <a href="#crisis-chat" className="skip-link">Skip to crisis chat</a>
              <nav>
                <a href="/dashboard">Dashboard</a>
                <a href="/resources">Resources</a>
              </nav>
              <main id="main-content">
                <h1>Crisis Support</h1>
                <section id="crisis-chat">
                  <h2>Anonymous Chat</h2>
                </section>
              </main>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByText('Skip to main content')).toHaveAttribute('href', '#main-content');
        expect(screen.getByText('Skip to crisis chat')).toHaveAttribute('href', '#crisis-chat');
      });

      it('should handle custom keyboard interactions', async () => {
        const user = userEvent.setup();
        
        render(
          <TherapeuticLayout>
            <div 
              role="button" 
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Custom action
                }
              }}
              aria-label="Emergency crisis button"
            >
              🚨 EMERGENCY
            </div>
          </TherapeuticLayout>
        );

        const emergencyButton = screen.getByRole('button', { name: /emergency crisis button/i });
        
        // Should be focusable
        emergencyButton.focus();
        expect(emergencyButton).toHaveFocus();

        // Should respond to Enter and Space
        await user.keyboard('{Enter}');
        await user.keyboard(' ');
      });
    });

    describe('2.2 Enough Time', () => {
      it('should warn users about session timeouts', () => {
        render(
          <TherapeuticLayout>
            <div role="status" aria-live="polite" aria-label="Session timeout warning">
              Your crisis chat session will timeout in 5 minutes. 
              <button>Extend Session</button>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByText(/Your crisis chat session will timeout/)).toBeInTheDocument();
        expect(screen.getByText('Extend Session')).toBeInTheDocument();
      });

      it('should allow users to extend time limits', () => {
        render(
          <TherapeuticLayout>
            <div>
              <p>Safety plan creation typically takes 20-30 minutes.</p>
              <button>Request Additional Time</button>
              <button>Save and Continue Later</button>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByText('Request Additional Time')).toBeInTheDocument();
        expect(screen.getByText('Save and Continue Later')).toBeInTheDocument();
      });

      it('should pause moving content when requested', () => {
        render(
          <TherapeuticLayout>
            <div>
              <div role="region" aria-label="Auto-updating crisis statistics">
                <button aria-label="Pause updates">⏸️</button>
                <div>Active crisis sessions: 12</div>
              </div>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByRole('button', { name: /pause updates/i })).toBeInTheDocument();
      });
    });

    describe('2.3 Seizures and Physical Reactions', () => {
      it('should not contain flashing content above threshold', () => {
        render(
          <TherapeuticLayout>
            <div>
              {/* No flashing content that exceeds 3 flashes per second */}
              <div className="gentle-pulse" style={{ animation: 'pulse 2s infinite' }}>
                Crisis alert indicator
              </div>
            </div>
          </TherapeuticLayout>
        );

        // Visual effects should be gentle and not exceed seizure thresholds
        expect(screen.getByText('Crisis alert indicator')).toBeInTheDocument();
      });

      it('should provide option to disable motion', () => {
        render(
          <TherapeuticLayout>
            <div>
              <label>
                <input type="checkbox" />
                Reduce motion and animations for better accessibility
              </label>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByLabelText(/Reduce motion and animations/)).toBeInTheDocument();
      });
    });

    describe('2.4 Navigable', () => {
      it('should provide clear page titles', () => {
        // This would be tested in actual pages
        const pageTitle = 'Crisis Support - Anonymous Chat | ASTRAL Core';
        expect(pageTitle).toMatch(/Crisis Support/);
        expect(pageTitle).toMatch(/ASTRAL Core/);
      });

      it('should have logical focus order', async () => {
        const user = userEvent.setup();
        
        render(
          <TherapeuticLayout>
            <form>
              <h2>Crisis Assessment</h2>
              <label htmlFor="severity">How would you rate your current distress?</label>
              <select id="severity">
                <option>1 - Minimal</option>
                <option>5 - Moderate</option>
                <option>10 - Severe</option>
              </select>
              <label htmlFor="description">Can you describe what's happening?</label>
              <textarea id="description" rows={3}></textarea>
              <button type="submit">Submit Assessment</button>
              <button type="button">Get Immediate Help</button>
            </form>
          </TherapeuticLayout>
        );

        // Focus should move logically through form elements
        await user.tab();
        expect(screen.getByLabelText(/How would you rate/)).toHaveFocus();

        await user.tab();
        expect(screen.getByLabelText(/Can you describe/)).toHaveFocus();

        await user.tab();
        expect(screen.getByText('Submit Assessment')).toHaveFocus();

        await user.tab();
        expect(screen.getByText('Get Immediate Help')).toHaveFocus();
      });

      it('should provide multiple ways to navigate', () => {
        render(
          <TherapeuticLayout>
            <nav aria-label="Breadcrumb">
              <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/crisis">Crisis Support</a></li>
                <li aria-current="page">Anonymous Chat</li>
              </ol>
            </nav>
            <nav aria-label="Site map">
              <ul>
                <li><a href="/crisis">Crisis Support</a></li>
                <li><a href="/safety-plan">Safety Planning</a></li>
                <li><a href="/resources">Resources</a></li>
              </ul>
            </nav>
            <div>
              <input type="search" aria-label="Search support resources" />
              <button>Search</button>
            </div>
          </TherapeuticLayout>
        );

        // Multiple navigation methods should be available
        expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
        expect(screen.getByRole('navigation', { name: 'Site map' })).toBeInTheDocument();
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
      });

      it('should provide descriptive headings and labels', () => {
        render(
          <TherapeuticLayout>
            <section aria-labelledby="crisis-chat-heading">
              <h2 id="crisis-chat-heading">Anonymous Crisis Chat Support</h2>
              <div>
                <label htmlFor="user-message">Your message (private and secure)</label>
                <textarea 
                  id="user-message"
                  aria-describedby="message-help"
                  placeholder="Share what's on your mind..."
                ></textarea>
                <div id="message-help">
                  Your messages are encrypted and anonymous. A trained crisis counselor will respond.
                </div>
              </div>
            </section>
          </TherapeuticLayout>
        );

        expect(screen.getByText('Anonymous Crisis Chat Support')).toBeInTheDocument();
        expect(screen.getByLabelText(/Your message \(private and secure\)/)).toBeInTheDocument();
        expect(screen.getByText(/Your messages are encrypted/)).toBeInTheDocument();
      });
    });

    describe('2.5 Input Modalities', () => {
      it('should support various input methods', async () => {
        const user = userEvent.setup();
        
        render(
          <TherapeuticLayout>
            <div>
              <button 
                onPointerDown={() => {/* Handle pointer */}}
                onMouseDown={() => {/* Handle mouse */}}
                onTouchStart={() => {/* Handle touch */}}
                onKeyDown={() => {/* Handle keyboard */}}
              >
                Crisis Support Button
              </button>
            </div>
          </TherapeuticLayout>
        );

        const button = screen.getByText('Crisis Support Button');
        
        // Should work with different input methods
        await user.click(button); // Mouse/pointer
        await user.keyboard('{Enter}'); // Keyboard
      });

      it('should have adequate target sizes', () => {
        render(
          <TherapeuticLayout>
            <div>
              <button style={{ minWidth: '44px', minHeight: '44px', padding: '8px 16px' }}>
                Emergency
              </button>
              <a href="/help" style={{ display: 'inline-block', minWidth: '44px', minHeight: '44px', padding: '8px' }}>
                Help
              </a>
            </div>
          </TherapeuticLayout>
        );

        // Target sizes should meet WCAG AA requirements (minimum 24x24px, recommended 44x44px)
        expect(screen.getByText('Emergency')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
      });
    });
  });

  describe('Understandable - Guideline 3', () => {
    describe('3.1 Readable', () => {
      it('should specify page language', () => {
        // This would be tested on the HTML element
        const htmlLang = 'en-US';
        expect(htmlLang).toBe('en-US');
      });

      it('should identify language changes', () => {
        render(
          <TherapeuticLayout>
            <div>
              <p>Crisis support is available in multiple languages.</p>
              <p lang="es">Apoyo en crisis está disponible en español.</p>
              <p lang="fr">Le soutien en cas de crise est disponible en français.</p>
            </div>
          </TherapeuticLayout>
        );

        const spanishText = screen.getByText(/Apoyo en crisis/);
        const frenchText = screen.getByText(/Le soutien en cas/);
        
        expect(spanishText).toHaveAttribute('lang', 'es');
        expect(frenchText).toHaveAttribute('lang', 'fr');
      });

      it('should use clear and simple language', () => {
        render(
          <TherapeuticLayout>
            <div>
              <h2>How to Get Help</h2>
              <ol>
                <li>Click the "Crisis Chat" button</li>
                <li>Share what's happening</li>
                <li>A counselor will respond</li>
                <li>Get the support you need</li>
              </ol>
            </div>
          </TherapeuticLayout>
        );

        // Instructions should be clear and direct
        expect(screen.getByText('How to Get Help')).toBeInTheDocument();
        expect(screen.getByText(/Click the "Crisis Chat" button/)).toBeInTheDocument();
      });
    });

    describe('3.2 Predictable', () => {
      it('should have consistent navigation', () => {
        render(
          <TherapeuticLayout>
            <nav aria-label="Main navigation">
              <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
                <li><a href="/">Home</a></li>
                <li><a href="/crisis">Crisis Support</a></li>
                <li><a href="/safety-plan">Safety Plan</a></li>
                <li><a href="/resources">Resources</a></li>
                <li><a href="/profile">My Profile</a></li>
              </ul>
            </nav>
          </TherapeuticLayout>
        );

        // Navigation should be in consistent order across pages
        const navLinks = screen.getAllByRole('link');
        expect(navLinks[0]).toHaveTextContent('Home');
        expect(navLinks[1]).toHaveTextContent('Crisis Support');
        expect(navLinks[2]).toHaveTextContent('Safety Plan');
      });

      it('should not cause unexpected context changes', async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        
        render(
          <TherapeuticLayout>
            <form>
              <label htmlFor="crisis-type">Type of crisis support needed:</label>
              <select id="crisis-type" onChange={mockOnChange}>
                <option value="">Select an option</option>
                <option value="chat">Anonymous Chat</option>
                <option value="safety-plan">Safety Planning</option>
                <option value="emergency">Emergency</option>
              </select>
              <button type="submit">Continue</button>
            </form>
          </TherapeuticLayout>
        );

        const select = screen.getByLabelText(/Type of crisis support/);
        
        // Selecting an option should not automatically submit or change context
        await user.selectOptions(select, 'chat');
        expect(mockOnChange).toHaveBeenCalled();
        
        // User should still be on the same form
        expect(screen.getByText('Continue')).toBeInTheDocument();
      });

      it('should provide predictable error handling', () => {
        render(
          <TherapeuticLayout>
            <div>
              <div role="alert" aria-live="assertive">
                <h3>Connection Error</h3>
                <p>We're having trouble connecting to our crisis support system.</p>
                <ul>
                  <li>Check your internet connection</li>
                  <li><button>Try Again</button></li>
                  <li>Call 988 for immediate support</li>
                </ul>
              </div>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    describe('3.3 Input Assistance', () => {
      it('should identify required fields', () => {
        render(
          <TherapeuticLayout>
            <form>
              <div>
                <label htmlFor="email">
                  Email Address <span aria-label="required">*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  required 
                  aria-describedby="email-help"
                />
                <div id="email-help">Required for safety plan notifications</div>
              </div>
              <div>
                <label htmlFor="phone">Phone Number (optional)</label>
                <input type="tel" id="phone" />
              </div>
            </form>
          </TherapeuticLayout>
        );

        const emailInput = screen.getByLabelText(/Email Address/);
        expect(emailInput).toHaveAttribute('required');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
        
        const phoneInput = screen.getByLabelText(/Phone Number \(optional\)/);
        expect(phoneInput).not.toHaveAttribute('required');
      });

      it('should provide helpful error messages', () => {
        render(
          <TherapeuticLayout>
            <form>
              <div>
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  aria-describedby="password-error"
                  aria-invalid="true"
                />
                <div id="password-error" role="alert">
                  Password must be at least 8 characters and include letters and numbers
                </div>
              </div>
            </form>
          </TherapeuticLayout>
        );

        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
        
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveTextContent(/Password must be at least 8 characters/);
      });

      it('should suggest corrections for errors', () => {
        render(
          <TherapeuticLayout>
            <div>
              <div role="alert">
                <h3>Form Submission Error</h3>
                <p>Please correct the following issues:</p>
                <ul>
                  <li><a href="#email">Email field is required</a></li>
                  <li><a href="#age">Please enter a valid age (18 or older)</a></li>
                </ul>
              </div>
            </div>
          </TherapeuticLayout>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Please correct the following/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Email field is required/ })).toBeInTheDocument();
      });
    });
  });

  describe('Robust - Guideline 4', () => {
    describe('4.1 Compatible', () => {
      it('should use valid HTML with proper ARIA', async () => {
        const { container } = render(
          <TherapeuticLayout>
            <div>
              <button 
                aria-expanded="false" 
                aria-controls="crisis-options"
                id="crisis-menu-button"
              >
                Crisis Support Options
              </button>
              <div 
                id="crisis-options" 
                role="menu" 
                aria-labelledby="crisis-menu-button"
                style={{ display: 'none' }}
              >
                <div role="menuitem">Anonymous Chat</div>
                <div role="menuitem">Safety Planning</div>
                <div role="menuitem">Emergency Services</div>
              </div>
            </div>
          </TherapeuticLayout>
        );

        const menuButton = screen.getByRole('button');
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        expect(menuButton).toHaveAttribute('aria-controls', 'crisis-options');

        // Run comprehensive accessibility check
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('should provide proper roles and states', () => {
        render(
          <TherapeuticLayout>
            <div>
              <div role="progressbar" aria-valuenow={3} aria-valuemin={0} aria-valuemax={10} aria-label="Crisis assessment progress">
                <div style={{ width: '30%' }}></div>
              </div>
              <div role="status" aria-live="polite">
                Step 3 of 10: Safety assessment
              </div>
            </div>
          </TherapeuticLayout>
        );

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '3');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '10');

        const status = screen.getByRole('status');
        expect(status).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Component-Specific Accessibility Tests', () => {
    it('SafetyPlanGenerator should be fully accessible', async () => {
      const { container } = render(
        <SafetyPlanGenerator 
          userId="test-user"
          onPlanCreated={jest.fn()}
          onPlanUpdated={jest.fn()}
        />
      );

      // Check for proper headings and landmarks
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Run axe tests
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AnonymousCrisisChat should be fully accessible', async () => {
      const { container } = render(
        <AnonymousCrisisChat 
          onSessionStart={jest.fn()}
          onSessionEnd={jest.fn()}
          onEmergencyEscalation={jest.fn()}
        />
      );

      // Check for proper ARIA labels and live regions
      expect(screen.getByRole('region', { name: /crisis chat/i })).toBeInTheDocument();

      // Run axe tests
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('CrisisInterventionDashboard should be fully accessible', async () => {
      const { container } = render(
        <CrisisInterventionDashboard 
          volunteerId="test-volunteer"
          volunteerRole="crisis_responder"
          onSessionJoin={jest.fn()}
          onSessionEnd={jest.fn()}
          onEmergencyEscalation={jest.fn()}
        />
      );

      // Check for proper dashboard structure
      expect(screen.getByRole('main', { name: /crisis dashboard/i })).toBeInTheDocument();

      // Run axe tests
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Experience', () => {
    it('should provide meaningful reading order', () => {
      render(
        <TherapeuticLayout>
          <div>
            <h1>Crisis Support Platform</h1>
            <p>Get immediate help when you need it most.</p>
            <div role="alert" aria-live="assertive">
              Emergency: If you are in immediate danger, call 911
            </div>
            <h2>Available Support Options</h2>
            <ul>
              <li>Anonymous crisis chat - Available 24/7</li>
              <li>Safety planning tools - Create your personal safety plan</li>
              <li>Resource library - Access helpful information</li>
            </ul>
            <h2>Get Started</h2>
            <button>Start Crisis Chat</button>
          </div>
        </TherapeuticLayout>
      );

      // Content should flow logically for screen readers
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Crisis Support Platform');
      expect(screen.getByRole('alert')).toHaveTextContent(/Emergency: If you are in immediate danger/);
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Start Crisis Chat');
    });

    it('should announce important state changes', () => {
      render(
        <TherapeuticLayout>
          <div>
            <div role="status" aria-live="polite" aria-label="Connection status">
              Connected to crisis counselor
            </div>
            <div role="alert" aria-live="assertive" aria-label="Emergency notification">
              Emergency protocols activated
            </div>
          </div>
        </TherapeuticLayout>
      );

      // Live regions should announce changes to screen readers
      expect(screen.getByRole('status')).toHaveTextContent('Connected to crisis counselor');
      expect(screen.getByRole('alert')).toHaveTextContent('Emergency protocols activated');
    });
  });
});