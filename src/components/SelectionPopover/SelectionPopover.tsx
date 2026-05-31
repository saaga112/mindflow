'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GitBranch, Send, X } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { useAIChat } from '@/hooks/useAIChat';

export function SelectionPopover() {
  const selectionState = useFlowStore((s) => s.selectionState);
  const clearSelection = useFlowStore((s) => s.clearSelection);
  const { sendQuestion } = useAIChat();
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectionState.isActive) {
      setQuestion('');
      setIsExpanded(false);
    }
  }, [selectionState.isActive]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    if (!selectionState.isActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-popover')) {
        clearSelection();
      }
    };

    // Delay to avoid immediately closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [selectionState.isActive, clearSelection]);

  const handleBranch = useCallback(async () => {
    if (!question.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await sendQuestion(
        question.trim(),
        selectionState.sourceNodeId,
        selectionState.text
      );
      clearSelection();
    } finally {
      setIsSubmitting(false);
    }
  }, [question, isSubmitting, sendQuestion, selectionState, clearSelection]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBranch();
      }
      if (e.key === 'Escape') {
        clearSelection();
      }
    },
    [handleBranch, clearSelection]
  );

  if (!selectionState.isActive) return null;

  return (
    <div
      className="selection-popover"
      style={{
        position: 'fixed',
        left: selectionState.x,
        top: selectionState.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 'var(--z-popover)',
      }}
    >
      <style>{`
        .selection-popover {
          animation: fadeInUp 200ms var(--ease-spring);
        }
        .selection-popover-inner {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--glass-bg-strong);
          backdrop-filter: blur(var(--glass-blur-strong));
          -webkit-backdrop-filter: blur(var(--glass-blur-strong));
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          min-width: 200px;
          max-width: 380px;
        }
        .selection-popover-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-2);
        }
        .selection-popover-header button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: var(--radius-md);
          color: var(--cyan-400);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          flex: 1;
        }
        .selection-popover-header button:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.4);
        }
        .selection-popover-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }
        .selection-popover-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .selection-popover-preview {
          padding: var(--space-1) var(--space-3);
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-style: italic;
          max-height: 40px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .selection-popover-input {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-2);
        }
        .selection-popover-input input {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          outline: none;
        }
        .selection-popover-input input:focus {
          border-color: var(--cyan-500);
          box-shadow: 0 0 0 2px var(--cyan-glow);
        }
        .selection-popover-input button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--cyan-600), var(--purple-600));
          color: white;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          flex-shrink: 0;
        }
        .selection-popover-input button:hover:not(:disabled) {
          box-shadow: 0 4px 16px var(--cyan-glow);
        }
        .selection-popover-input button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      <div className="selection-popover-inner">
        {!isExpanded ? (
          <div className="selection-popover-header">
            <button onClick={() => setIsExpanded(true)}>
              <GitBranch size={14} />
              Ask about this
            </button>
            <button className="selection-popover-close" onClick={clearSelection}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="selection-popover-preview">
              &ldquo;{selectionState.text.slice(0, 80)}
              {selectionState.text.length > 80 ? '...' : ''}&rdquo;
            </div>
            <div className="selection-popover-input">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your question..."
                disabled={isSubmitting}
              />
              <button
                onClick={handleBranch}
                disabled={!question.trim() || isSubmitting}
                title="Create branch"
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
