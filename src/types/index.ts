import type { Node, Edge } from '@xyflow/react';

// ─── Node Data Types ─────────────────────────────────────────────────────────

export interface QuestionNodeData {
  [key: string]: unknown;
  type: 'question';
  content: string;
  timestamp: number;
  parentNodeId?: string;
  highlightedText?: string;
}

export interface AnswerNodeData {
  [key: string]: unknown;
  type: 'answer';
  content: string;
  isStreaming: boolean;
  model: string;
  timestamp: number;
  error?: string;
}

export interface NoteNodeData {
  [key: string]: unknown;
  type: 'note';
  content: string;
  color: string;
  timestamp: number;
}

export type MindFlowNodeData = QuestionNodeData | AnswerNodeData | NoteNodeData;

// ─── React Flow Node/Edge aliases ────────────────────────────────────────────

export type MindFlowNode = Node<MindFlowNodeData>;
export type QuestionNode = Node<QuestionNodeData>;
export type AnswerNode = Node<AnswerNodeData>;
export type NoteNode = Node<NoteNodeData>;

export type MindFlowEdge = Edge & {
  data?: {
    isBranch?: boolean;
    isStreaming?: boolean;
  };
};

// ─── Flow Session (persisted) ────────────────────────────────────────────────

export interface FlowSession {
  id: string;
  title: string;
  nodes: MindFlowNode[];
  edges: MindFlowEdge[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: number;
  updatedAt: number;
}

// ─── AI / Settings ───────────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey: string;
  systemPrompt: string;
}

// ─── Context Menu ────────────────────────────────────────────────────────────

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  nodeId?: string;
}

// ─── Selection Popover ───────────────────────────────────────────────────────

export interface SelectionState {
  isActive: boolean;
  text: string;
  x: number;
  y: number;
  sourceNodeId: string;
}
