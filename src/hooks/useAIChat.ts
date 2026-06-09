'use client';

import { useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { useSettingsStore } from '@/store/settingsStore';

export function useAIChat() {
  const addQuestionNode = useFlowStore((s) => s.addQuestionNode);
  const updateAnswerContent = useFlowStore((s) => s.updateAnswerContent);
  const finalizeAnswer = useFlowStore((s) => s.finalizeAnswer);
  const setAnswerError = useFlowStore((s) => s.setAnswerError);
  const getConversationContext = useFlowStore((s) => s.getConversationContext);
  const autoLayout = useFlowStore((s) => s.autoLayout);

  const apiMode = useSettingsStore((s) => s.apiMode);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const provider = useSettingsStore((s) => s.provider);
  const model = useSettingsStore((s) => s.model);
  const systemPrompt = useSettingsStore((s) => s.systemPrompt);
  const autoLayoutEnabled = useSettingsStore((s) => s.autoLayoutEnabled);

  const sendQuestion = useCallback(
    async (
      question: string,
      parentNodeId?: string,
      highlightedText?: string,
      position?: { x: number; y: number }
    ) => {
      // Create the question + answer node pair
      const { questionNodeId, answerNodeId } = addQuestionNode(
        question,
        parentNodeId,
        highlightedText,
        position,
        model
      );

      // Auto-layout if enabled
      if (autoLayoutEnabled) {
        setTimeout(() => autoLayout(), 50);
      }

      // Build conversation context by walking up the graph
      const messages = getConversationContext(questionNodeId);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages, systemPrompt, apiMode, apiKey, provider, model }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Read the streaming response
        // toTextStreamResponse() uses the Vercel AI SDK data stream protocol.
        // Each line looks like: 0:"chunk text"\n  — we extract just the text part.
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              // Data stream format: 0:"text chunk"
              if (line.startsWith('0:')) {
                try {
                  const text = JSON.parse(line.slice(2));
                  updateAnswerContent(answerNodeId, text);
                } catch {
                  // skip malformed lines
                }
              }
            }
          }
        }
        // Flush any remaining buffer
        if (buffer.startsWith('0:')) {
          try {
            const text = JSON.parse(buffer.slice(2));
            updateAnswerContent(answerNodeId, text);
          } catch { /* ignore */ }
        }

        finalizeAnswer(answerNodeId);

        // Re-layout after answer is complete
        if (autoLayoutEnabled) {
          setTimeout(() => autoLayout(), 100);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setAnswerError(answerNodeId, message);
      }
    },
    [
      addQuestionNode,
      updateAnswerContent,
      finalizeAnswer,
      setAnswerError,
      getConversationContext,
      autoLayout,
      apiMode,
      apiKey,
      provider,
      model,
      systemPrompt,
      autoLayoutEnabled,
    ]
  );

  return { sendQuestion };
}
