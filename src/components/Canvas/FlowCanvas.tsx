'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowStore } from '@/store/flowStore';
import { QuestionNode } from '@/components/Nodes/QuestionNode';
import { AnswerNode } from '@/components/Nodes/AnswerNode';
import { NoteNode } from '@/components/Nodes/NoteNode';
import { AnimatedEdge } from '@/components/Edges/AnimatedEdge';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { InputBar } from '@/components/InputBar/InputBar';
import { ContextMenu } from '@/components/ContextMenu/ContextMenu';
import { SelectionPopover } from '@/components/SelectionPopover/SelectionPopover';
import { SettingsModal } from '@/components/SettingsModal/SettingsModal';
import { Workflow } from 'lucide-react';

import './FlowCanvas.css';

const nodeTypes: NodeTypes = {
  questionNode: QuestionNode,
  answerNode: AnswerNode,
  noteNode: NoteNode,
};

const edgeTypes: EdgeTypes = {
  animatedEdge: AnimatedEdge,
};

const miniMapNodeColor = (node: Node) => {
  const data = node.data as { type?: string };
  switch (data?.type) {
    case 'question':
      return '#06b6d4';
    case 'answer':
      return '#8b5cf6';
    case 'note':
      return '#f59e0b';
    default:
      return '#64748b';
  }
};

export function FlowCanvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setContextMenu = useFlowStore((s) => s.setContextMenu);
  const closeContextMenu = useFlowStore((s) => s.closeContextMenu);
  const clearSelection = useFlowStore((s) => s.clearSelection);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        isOpen: true,
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [setContextMenu]
  );

  const handlePaneClick = useCallback(() => {
    closeContextMenu();
    clearSelection();
  }, [closeContextMenu, clearSelection]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'animatedEdge',
      animated: true,
    }),
    []
  );

  const isEmpty = nodes.length === 0;

  return (
    <div className="canvas-wrapper" id="mindflow-canvas">
      <div className="canvas-gradient" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(148, 163, 184, 0.15)"
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(10, 10, 26, 0.85)"
          style={{ width: 160, height: 100 }}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Empty state */}
      {isEmpty && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Workflow size={36} color="#8b5cf6" />
          </div>
          <h2>Welcome to MindFlow</h2>
          <p>
            Start your learning journey by asking a question below. 
            Your conversation will grow as a visual knowledge tree.
          </p>
          <div className="keyboard-hint">
            <span>Highlight any AI text to branch off</span>
          </div>
        </div>
      )}

      {/* Floating UI */}
      <Toolbar onOpenSettings={() => setSettingsOpen(true)} />
      <InputBar />
      <ContextMenu />
      <SelectionPopover />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
