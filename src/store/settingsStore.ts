import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProvider } from '@/types';

export type APIMode = 'platform' | 'custom';

interface SettingsStore {
  // AI Settings
  apiMode: APIMode;
  provider: AIProvider;
  model: string;
  apiKey: string;
  systemPrompt: string;

  // UI Preferences
  autoLayoutEnabled: boolean;
  animationsEnabled: boolean;
  sidebarOpen: boolean;

  // Actions
  setApiMode: (mode: APIMode) => void;
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (key: string) => void;
  setSystemPrompt: (prompt: string) => void;
  toggleAutoLayout: () => void;
  toggleAnimations: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const DEFAULT_SYSTEM_PROMPT = `You are MindFlow, a patient and engaging AI tutor. Your role is to teach concepts clearly and thoroughly.

Guidelines:
- Use clear explanations with examples
- Break complex topics into digestible parts
- Use markdown formatting: headings, bullet points, code blocks, tables
- When explaining code, always include working examples
- Be encouraging and supportive
- If a student highlights specific text to ask about, focus your explanation on that specific concept`;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiMode: 'platform',
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: '',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,

      autoLayoutEnabled: true,
      animationsEnabled: true,
      sidebarOpen: false,

      setApiMode: (mode) => set({ apiMode: mode }),
      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      setApiKey: (key) => set({ apiKey: key }),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      toggleAutoLayout: () =>
        set((s) => ({ autoLayoutEnabled: !s.autoLayoutEnabled })),
      toggleAnimations: () =>
        set((s) => ({ animationsEnabled: !s.animationsEnabled })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'mindflow-settings',
    }
  )
);
