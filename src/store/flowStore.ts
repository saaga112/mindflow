import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type {
  MindFlowNode,
  MindFlowEdge,
  ContextMenuState,
  SelectionState,
} from '@/types';
import { getLayoutedElements } from '@/lib/layout';

// ─── Helper: generate unique IDs ────────────────────────────────────────────

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface FlowStore {
  // ── Node & Edge state ──
  nodes: MindFlowNode[];
  edges: MindFlowEdge[];

  // ── React Flow handlers ──
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // ── Node operations ──
  addQuestionNode: (
    content: string,
    parentId?: string,
    highlightedText?: string,
    position?: { x: number; y: number },
    model?: string
  ) => { questionNodeId: string; answerNodeId: string };

  updateAnswerContent: (nodeId: string, chunk: string) => void;
  setAnswerContent: (nodeId: string, content: string) => void;
  finalizeAnswer: (nodeId: string) => void;
  setAnswerError: (nodeId: string, error: string) => void;

  addNoteNode: (content: string, position: { x: number; y: number }) => string;
  updateNoteContent: (nodeId: string, content: string) => void;
  deleteNode: (nodeId: string) => void;

  // ── Context building ──
  getConversationContext: (nodeId: string) => Array<{ role: 'user' | 'assistant'; content: string }>;

  // ── Layout ──
  autoLayout: () => void;

  // ── Session ──
  currentSessionId: string | null;
  setSession: (nodes: MindFlowNode[], edges: MindFlowEdge[]) => void;
  clearCanvas: () => void;

  // ── UI state ──
  contextMenu: ContextMenuState;
  setContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;

  selectionState: SelectionState;
  setSelectionState: (state: SelectionState) => void;
  clearSelection: () => void;
}

// ─── Store Implementation ────────────────────────────────────────────────────

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],

  // ── React Flow change handlers ──

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as MindFlowNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as MindFlowEdge[] });
  },

  onConnect: (connection) => {
    const newEdge: MindFlowEdge = {
      id: generateId('edge'),
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: 'smoothstep',
      animated: true,
    };
    set({ edges: [...get().edges, newEdge] });
  },

  // ── Node operations ──

  addQuestionNode: (content, parentId, highlightedText, position, model) => {
    const { nodes, edges } = get();
    const questionNodeId = generateId('q');
    const answerNodeId = generateId('a');

    // Calculate position
    let qPos = position || { x: 0, y: 0 };
    if (parentId) {
      const parentNode = nodes.find((n) => n.id === parentId);
      if (parentNode) {
        // Branch: offset to the right of the parent
        const siblingCount = edges.filter((e) => e.source === parentId).length;
        qPos = {
          x: parentNode.position.x + 500 + siblingCount * 200,
          y: parentNode.position.y + 100,
        };
      }
    } else if (nodes.length > 0) {
      // New root: place below the last node
      const maxY = Math.max(...nodes.map((n) => n.position.y));
      qPos = { x: 0, y: maxY + 400 };
    }

    const questionNode: MindFlowNode = {
      id: questionNodeId,
      type: 'questionNode',
      position: qPos,
      data: {
        type: 'question',
        content,
        timestamp: Date.now(),
        parentNodeId: parentId,
        highlightedText,
      },
    };

    const answerNode: MindFlowNode = {
      id: answerNodeId,
      type: 'answerNode',
      position: { x: qPos.x, y: qPos.y + 160 },
      data: {
        type: 'answer',
        content: '',
        isStreaming: true,
        model: model || 'gpt-4o',
        timestamp: Date.now(),
      },
    };

    const newEdges: MindFlowEdge[] = [];

    // Connect parent answer → new question (branch)
    if (parentId) {
      newEdges.push({
        id: generateId('edge'),
        source: parentId,
        target: questionNodeId,
        type: 'animatedEdge',
        animated: true,
        data: { isBranch: true },
      });
    }

    // Connect question → answer
    newEdges.push({
      id: generateId('edge'),
      source: questionNodeId,
      target: answerNodeId,
      type: 'animatedEdge',
      animated: true,
      data: { isStreaming: true },
    });

    set({
      nodes: [...nodes, questionNode, answerNode],
      edges: [...edges, ...newEdges],
    });

    return { questionNodeId, answerNodeId };
  },

  updateAnswerContent: (nodeId, chunk) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId && n.data.type === 'answer'
          ? { ...n, data: { ...n.data, content: n.data.content + chunk } }
          : n
      ),
    });
  },

  setAnswerContent: (nodeId, content) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId && n.data.type === 'answer'
          ? { ...n, data: { ...n.data, content } }
          : n
      ),
    });
  },

  finalizeAnswer: (nodeId) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId && n.data.type === 'answer'
          ? { ...n, data: { ...n.data, isStreaming: false } }
          : n
      ),
      edges: get().edges.map((e) =>
        e.target === nodeId
          ? { ...e, data: { ...e.data, isStreaming: false } }
          : e
      ),
    });
  },

  setAnswerError: (nodeId, error) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId && n.data.type === 'answer'
          ? { ...n, data: { ...n.data, isStreaming: false, error, content: '' } }
          : n
      ),
    });
  },

  addNoteNode: (content, position) => {
    const noteId = generateId('note');
    const noteNode: MindFlowNode = {
      id: noteId,
      type: 'noteNode',
      position,
      data: {
        type: 'note',
        content,
        color: '#f59e0b',
        timestamp: Date.now(),
      },
    };
    set({ nodes: [...get().nodes, noteNode] });
    return noteId;
  },

  updateNoteContent: (nodeId, content) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId && n.data.type === 'note'
          ? { ...n, data: { ...n.data, content } }
          : n
      ),
    });
  },

  deleteNode: (nodeId) => {
    // Also delete all descendant nodes
    const { nodes, edges } = get();
    const toDelete = new Set<string>();

    function collectDescendants(id: string) {
      toDelete.add(id);
      edges
        .filter((e) => e.source === id)
        .forEach((e) => collectDescendants(e.target));
    }
    collectDescendants(nodeId);

    set({
      nodes: nodes.filter((n) => !toDelete.has(n.id)),
      edges: edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target)),
    });
  },

  // ── Context building (walks graph ancestry) ──

  getConversationContext: (questionNodeId) => {
    const { nodes, edges } = get();
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    function walkUp(nodeId: string) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (node.data.type === 'question') {
        let content = node.data.content;
        if (node.data.highlightedText) {
          content = `[Regarding: "${node.data.highlightedText}"]\n\n${content}`;
        }
        messages.unshift({ role: 'user', content });
      } else if (node.data.type === 'answer' && node.data.content) {
        messages.unshift({ role: 'assistant', content: node.data.content });
      }

      // Find parent edge
      const parentEdge = edges.find((e) => e.target === nodeId);
      if (parentEdge) {
        walkUp(parentEdge.source);
      }
    }

    walkUp(questionNodeId);
    return messages;
  },

  // ── Layout ──

  autoLayout: () => {
    const { nodes, edges } = get();
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB'
    );
    set({ nodes: layoutedNodes, edges: layoutedEdges });
  },

  // ── Session ──

  currentSessionId: null,

  setSession: (nodes, edges) => {
    set({ nodes, edges });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [] });
  },

  // ── UI state ──

  contextMenu: { isOpen: false, x: 0, y: 0 },
  setContextMenu: (state) => set({ contextMenu: state }),
  closeContextMenu: () =>
    set({ contextMenu: { isOpen: false, x: 0, y: 0 } }),

  selectionState: { isActive: false, text: '', x: 0, y: 0, sourceNodeId: '' },
  setSelectionState: (state) => set({ selectionState: state }),
  clearSelection: () =>
    set({
      selectionState: { isActive: false, text: '', x: 0, y: 0, sourceNodeId: '' },
    }),
}));
