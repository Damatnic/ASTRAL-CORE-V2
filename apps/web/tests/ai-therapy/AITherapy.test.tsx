/**
 * ASTRAL CORE V2 - AI Therapy System Tests
 * Testing conversational AI mental health support
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TherapyChat } from "@/components/ai-therapy/TherapyChat";
import { AITherapyHub } from "@/components/ai-therapy/AITherapyHub";
import "@testing-library/jest-dom";

describe("AI Therapy System", () => {
  describe("Therapist Selection", () => {
    it("should display all three AI therapists", () => {
      render(<AITherapyHub />);
      
      expect(screen.getByText("Dr. Aria")).toBeInTheDocument();
      expect(screen.getByText("Dr. Sage")).toBeInTheDocument();
      expect(screen.getByText("Dr. Luna")).toBeInTheDocument();
    });

    it("should show correct specializations for each therapist", () => {
      render(<AITherapyHub />);
      
      // Dr. Aria - CBT specialist
      const ariaCard = screen.getByText("Dr. Aria").closest("div");
      expect(ariaCard).toHaveTextContent("Cognitive Behavioral Therapy");
      expect(ariaCard).toHaveTextContent("Crisis Intervention");
      
      // Dr. Sage - Trauma specialist
      const sageCard = screen.getByText("Dr. Sage").closest("div");
      expect(sageCard).toHaveTextContent("Trauma-Informed Care");
      expect(sageCard).toHaveTextContent("Mindfulness");
      
      // Dr. Luna - Wellness specialist
      const lunaCard = screen.getByText("Dr. Luna").closest("div");
      expect(lunaCard).toHaveTextContent("Holistic Wellness");
      expect(lunaCard).toHaveTextContent("Sleep & Anxiety");
    });

    it("should start session with selected therapist", async () => {
      const onSessionStart = jest.fn();
      render(<AITherapyHub onSessionStart={onSessionStart} />);
      
      const ariaButton = screen.getByRole("button", { name: /start session with dr. aria/i });
      fireEvent.click(ariaButton);
      
      await waitFor(() => {
        expect(onSessionStart).toHaveBeenCalledWith({
          therapistId: "aria",
          therapistName: "Dr. Aria",
          sessionType: "ai_therapy",
          approach: "CBT"
        });
      });
    });
  });

  describe("Therapy Chat Interface", () => {
    it("should render chat interface with therapist info", () => {
      render(<TherapyChat therapistId="aria" />);
      
      expect(screen.getByText("Dr. Aria")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    });

    it("should send and receive messages", async () => {
      render(<TherapyChat therapistId="aria" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole("button", { name: /send/i });
      
      await userEvent.type(input, "I'm feeling anxious about work");
      fireEvent.click(sendButton);
      
      // Check user message appears
      await waitFor(() => {
        expect(screen.getByText("I'm feeling anxious about work")).toBeInTheDocument();
      });
      
      // Check AI response appears
      await waitFor(() => {
        expect(screen.getByText(/anxiety|worry|concern/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should detect crisis language in therapy chat", async () => {
      const onCrisisDetected = jest.fn();
      render(<TherapyChat therapistId="sage" onCrisisDetected={onCrisisDetected} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "I want to hurt myself");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        expect(onCrisisDetected).toHaveBeenCalledWith({
          severity: "high",
          message: "I want to hurt myself",
          interventionNeeded: true
        });
      });
      
      // Should show crisis resources
      expect(screen.getByText("988")).toBeInTheDocument();
      expect(screen.getByText(/immediate support/i)).toBeInTheDocument();
    });

    it("should maintain conversation context", async () => {
      render(<TherapyChat therapistId="luna" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      
      // First message
      await userEvent.type(input, "I have trouble sleeping");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        expect(screen.getByText("I have trouble sleeping")).toBeInTheDocument();
      });
      
      // Second message building on context
      await userEvent.clear(input);
      await userEvent.type(input, "I wake up multiple times");
      fireEvent.submit(input.closest("form")!);
      
      // AI should reference sleep context
      await waitFor(() => {
        const responses = screen.getAllByTestId("ai-message");
        const lastResponse = responses[responses.length - 1];
        expect(lastResponse).toHaveTextContent(/sleep|rest|wake/i);
      });
    });
  });

  describe("Therapeutic Techniques", () => {
    it("should apply CBT techniques with Dr. Aria", async () => {
      render(<TherapyChat therapistId="aria" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Everything always goes wrong for me");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const response = screen.getByTestId("ai-message");
        expect(response).toHaveTextContent(/thought|evidence|alternative|perspective/i);
      });
    });

    it("should apply mindfulness techniques with Dr. Sage", async () => {
      render(<TherapyChat therapistId="sage" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "I feel overwhelmed and can't focus");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const response = screen.getByTestId("ai-message");
        expect(response).toHaveTextContent(/breath|present|moment|ground|aware/i);
      });
    });

    it("should focus on wellness with Dr. Luna", async () => {
      render(<TherapyChat therapistId="luna" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "I have no energy and feel exhausted");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const response = screen.getByTestId("ai-message");
        expect(response).toHaveTextContent(/sleep|nutrition|exercise|routine|self-care/i);
      });
    });
  });

  describe("Session Management", () => {
    it("should track session duration", async () => {
      const { container } = render(<TherapyChat therapistId="aria" />);
      
      // Session timer should start
      await waitFor(() => {
        const timer = container.querySelector('[data-testid="session-timer"]');
        expect(timer).toBeInTheDocument();
        expect(timer).toHaveTextContent("00:00");
      });
      
      // Wait and check timer updates
      await waitFor(() => {
        const timer = container.querySelector('[data-testid="session-timer"]');
        expect(timer).not.toHaveTextContent("00:00");
      }, { timeout: 2000 });
    });

    it("should save session transcript", async () => {
      const onSessionSave = jest.fn();
      render(<TherapyChat therapistId="sage" onSessionEnd={onSessionSave} />);
      
      // Send some messages
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Test message 1");
      fireEvent.submit(input.closest("form")!);
      
      await userEvent.clear(input);
      await userEvent.type(input, "Test message 2");
      fireEvent.submit(input.closest("form")!);
      
      // End session
      const endButton = screen.getByRole("button", { name: /end session/i });
      fireEvent.click(endButton);
      
      await waitFor(() => {
        expect(onSessionSave).toHaveBeenCalledWith({
          therapistId: "sage",
          messages: expect.arrayContaining([
            expect.objectContaining({ content: "Test message 1" }),
            expect.objectContaining({ content: "Test message 2" })
          ]),
          duration: expect.any(Number),
          encrypted: true
        });
      });
    });

    it("should rate therapy session", async () => {
      render(<TherapyChat therapistId="luna" />);
      
      // End session to trigger rating
      const endButton = screen.getByRole("button", { name: /end session/i });
      fireEvent.click(endButton);
      
      // Rating modal should appear
      await waitFor(() => {
        expect(screen.getByText(/rate your session/i)).toBeInTheDocument();
      });
      
      // Select rating
      const stars = screen.getAllByLabelText(/star/i);
      fireEvent.click(stars[3]); // 4 stars
      
      // Add feedback
      const feedbackInput = screen.getByPlaceholderText(/feedback/i);
      await userEvent.type(feedbackInput, "Very helpful session");
      
      // Submit rating
      const submitButton = screen.getByRole("button", { name: /submit rating/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
      });
    });
  });

  describe("AI Response Quality", () => {
    it("should provide empathetic responses", async () => {
      render(<TherapyChat therapistId="aria" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "I feel like nobody understands me");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const response = screen.getByTestId("ai-message");
        expect(response).toHaveTextContent(/understand|hear|valid|feeling/i);
      });
    });

    it("should never provide medical advice", async () => {
      render(<TherapyChat therapistId="luna" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Should I stop taking my medication?");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const response = screen.getByTestId("ai-message");
        expect(response).toHaveTextContent(/doctor|medical professional|healthcare provider/i);
        expect(response).not.toHaveTextContent(/yes|no|stop|continue/i);
      });
    });

    it("should maintain appropriate boundaries", async () => {
      render(<TherapyChat therapistId="sage" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Can you be my friend?");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const response = screen.getByTestId("ai-message");
        expect(response).toHaveTextContent(/support|therapeutic|professional/i);
      });
    });
  });

  describe("Privacy and Encryption", () => {
    it("should encrypt all therapy messages", async () => {
      const encryptSpy = jest.spyOn(global.crypto.subtle, "encrypt");
      
      render(<TherapyChat therapistId="aria" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Private therapy information");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        expect(encryptSpy).toHaveBeenCalled();
      });
      
      encryptSpy.mockRestore();
    });

    it("should not store identifiable information", async () => {
      const storageSpy = jest.fn();
      global.localStorage.setItem = storageSpy;
      
      render(<TherapyChat therapistId="sage" anonymous={true} />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "My name is John Doe");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const calls = storageSpy.mock.calls;
        calls.forEach(call => {
          expect(call[1]).not.toContain("John Doe");
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("should be fully keyboard navigable", () => {
      const { container } = render(<TherapyChat therapistId="luna" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole("button", { name: /send/i });
      
      // Tab navigation
      input.focus();
      expect(document.activeElement).toBe(input);
      
      userEvent.tab();
      expect(document.activeElement).toBe(sendButton);
    });

    it("should announce AI responses to screen readers", async () => {
      render(<TherapyChat therapistId="aria" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Hello");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        const liveRegion = screen.getByRole("log", { hidden: false });
        expect(liveRegion).toHaveAttribute("aria-live", "polite");
        expect(liveRegion).toHaveTextContent(/dr. aria/i);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network error"));
      
      render(<TherapyChat therapistId="sage" />);
      
      const input = screen.getByPlaceholderText(/type your message/i);
      await userEvent.type(input, "Test message");
      fireEvent.submit(input.closest("form")!);
      
      await waitFor(() => {
        expect(screen.getByText(/connection issue/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });

    it("should handle session timeout", async () => {
      jest.useFakeTimers();
      
      render(<TherapyChat therapistId="luna" sessionTimeout={60000} />);
      
      // Fast forward past timeout
      jest.advanceTimersByTime(61000);
      
      await waitFor(() => {
        expect(screen.getByText(/session expired/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /start new session/i })).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });
});