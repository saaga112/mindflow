'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import './InputBar.css';

export function InputBar() {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendQuestion } = useAIChat();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setInput('');

    try {
      await sendQuestion(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  }, [input, isSubmitting, sendQuestion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="input-bar" id="main-input-bar">
      <div className="input-bar-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to learn?"
          rows={1}
          disabled={isSubmitting}
        />
        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!input.trim() || isSubmitting}
          title="Send (Enter)"
        >
          <Send size={18} />
        </button>
      </div>
      <div className="input-bar-hint">
        Press <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}
