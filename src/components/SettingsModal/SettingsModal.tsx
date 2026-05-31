'use client';

import { useState } from 'react';
import { X, Brain, Settings2, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import type { AIProvider } from '@/types';
import type { APIMode } from '@/store/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    apiMode,
    setApiMode,
    provider,
    setProvider,
    model,
    setModel,
    apiKey,
    setApiKey,
    systemPrompt,
    setSystemPrompt,
    autoLayoutEnabled,
    toggleAutoLayout,
  } = useSettingsStore();

  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider;
    setProvider(newProvider);
    // Set default model for the selected provider
    if (newProvider === 'openai') setModel('gpt-4o');
    if (newProvider === 'anthropic') setModel('claude-3-5-sonnet-20240620');
    if (newProvider === 'google') setModel('gemini-1.5-pro-latest');
  };

  return (
    <>
      <style>{`
        .settings-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: var(--z-modal);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 200ms var(--ease-out);
        }
        .settings-modal {
          width: min(520px, calc(100vw - 48px));
          max-height: calc(100vh - 96px);
          overflow-y: auto;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          animation: fadeInScale 300ms var(--ease-spring);
        }
        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--border-subtle);
        }
        .settings-header h2 {
          font-size: var(--text-lg);
          font-weight: 600;
        }
        .settings-header button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }
        .settings-header button:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .settings-body {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .settings-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .settings-section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .settings-section-title svg {
          color: var(--cyan-400);
        }
        .settings-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .settings-field label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .settings-field select, .settings-field textarea {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          outline: none;
        }
        .settings-field select:focus, .settings-field textarea:focus, .settings-field input:focus {
          border-color: var(--cyan-500);
          box-shadow: 0 0 0 2px var(--cyan-glow);
        }
        .settings-field .input-group {
          display: flex;
          gap: var(--space-2);
        }
        .settings-field .input-group .input {
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
        .settings-field .input-group button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          flex-shrink: 0;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          color: var(--text-muted);
          cursor: pointer;
        }
        .settings-field .input-group button:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        .settings-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .settings-toggle-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: var(--bg-hover);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-out);
          border: none;
        }
        .toggle-switch.active {
          background: linear-gradient(135deg, var(--cyan-600), var(--purple-600));
        }
        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform var(--duration-fast) var(--ease-spring);
        }
        .toggle-switch.active::after {
          transform: translateX(20px);
        }
        .settings-hint {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>

      <div className="settings-overlay" onClick={onClose}>
        <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="settings-header">
            <h2>Settings</h2>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="settings-body">
            {/* AI Configuration Section */}
            <div className="settings-section">
              <div className="settings-section-title">
                <Settings2 size={14} />
                AI Configuration
              </div>

              <div className="settings-field">
                <label>Authentication Mode</label>
                <select
                  value={apiMode}
                  onChange={(e) => setApiMode(e.target.value as APIMode)}
                >
                  <option value="platform">Platform Hosted (Requires Login)</option>
                  <option value="custom">Bring Your Own Key (No Login Required)</option>
                </select>
                <span className="settings-hint">
                  {apiMode === 'platform' 
                    ? "Use the platform's AI keys. You must sign in to use this."
                    : "Use your own API key. You don't need to sign in."}
                </span>
              </div>

              {apiMode === 'custom' && (
                <div className="settings-field">
                  <label>API Key</label>
                  <div className="input-group">
                    <input
                      className="input"
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                    <button onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="settings-hint">
                    Stored locally in your browser. Never sent to our servers (except directly to the AI provider).
                  </span>
                </div>
              )}

              <div className="settings-field">
                <label>Provider</label>
                <select value={provider} onChange={handleProviderChange}>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {provider === 'openai' && (
                    <>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </>
                  )}
                  {provider === 'anthropic' && (
                    <>
                      <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                      <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                    </>
                  )}
                  {provider === 'google' && (
                    <>
                      <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Tutor Section */}
            <div className="settings-section">
              <div className="settings-section-title">
                <Brain size={14} />
                AI Tutor Behavior
              </div>

              <div className="settings-field">
                <label>System Prompt</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  placeholder="Instructions for the AI tutor..."
                />
                <span className="settings-hint">
                  This prompt guides how the AI responds. Customize it for your learning style.
                </span>
              </div>
            </div>

            {/* Preferences */}
            <div className="settings-section">
              <div className="settings-section-title">
                Preferences
              </div>

              <div className="settings-toggle">
                <span className="settings-toggle-label">Auto-layout nodes</span>
                <button
                  className={`toggle-switch ${autoLayoutEnabled ? 'active' : ''}`}
                  onClick={toggleAutoLayout}
                  aria-label="Toggle auto layout"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
