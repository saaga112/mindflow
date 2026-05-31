'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AnswerNodeData } from '@/types';
import { useFlowStore } from '@/store/flowStore';
import { useState } from 'react';
import './nodes.css';

function AnswerNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as AnswerNodeData;
  const [copied, setCopied] = useState(false);
  const setSelectionState = useFlowStore((s) => s.setSelectionState);

  const timeStr = new Date(nodeData.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(nodeData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [nodeData.content]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

    const text = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectionState({
      isActive: true,
      text,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      sourceNodeId: id,
    });
  }, [id, setSelectionState]);

  // Error state
  if (nodeData.error) {
    return (
      <div className="node-card answer-node">
        <div className="node-accent" />
        <Handle type="target" position={Position.Top} id="target" />
        <div className="node-header">
          <div className="node-icon">
            <AlertCircle size={14} />
          </div>
          <span>Error</span>
        </div>
        <div className="node-body">
          <div className="answer-error">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Failed to get response</strong>
              <p style={{ marginTop: 4, opacity: 0.8 }}>{nodeData.error}</p>
            </div>
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} id="source" />
      </div>
    );
  }

  // Streaming with no content yet
  if (nodeData.isStreaming && !nodeData.content) {
    return (
      <div className="node-card answer-node streaming">
        <div className="node-accent" />
        <Handle type="target" position={Position.Top} id="target" />
        <div className="node-header">
          <div className="node-icon">
            <Sparkles size={14} />
          </div>
          <span>Thinking...</span>
          <div className="model-badge" style={{ marginLeft: 'auto' }}>
            <div className="badge-dot streaming" />
            {nodeData.model}
          </div>
        </div>
        <div className="streaming-shimmer">
          <div className="shimmer-line" />
          <div className="shimmer-line" />
          <div className="shimmer-line" />
        </div>
        <Handle type="source" position={Position.Bottom} id="source" />
      </div>
    );
  }

  return (
    <div className={`node-card answer-node ${nodeData.isStreaming ? 'streaming' : ''}`}>
      <div className="node-accent" />
      <Handle type="target" position={Position.Top} id="target" />

      <div className="node-header">
        <div className="node-icon">
          <Sparkles size={14} />
        </div>
        <span>Answer</span>
        <div className="model-badge" style={{ marginLeft: 'auto' }}>
          <div className={`badge-dot ${nodeData.isStreaming ? 'streaming' : ''}`} />
          {nodeData.model}
        </div>
      </div>

      {/* nodrag + nowheel classes allow text selection and scrolling inside the node */}
      <div
        className="node-body nodrag nowheel"
        onMouseUp={handleMouseUp}
      >
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {nodeData.content}
          </ReactMarkdown>
          {nodeData.isStreaming && <span className="streaming-cursor" />}
        </div>
      </div>

      <div className="node-footer">
        <span>{timeStr}</span>
        <div className="node-actions">
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy content'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  );
}

export const AnswerNode = memo(AnswerNodeComponent);
