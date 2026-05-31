'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MessageCircleQuestion } from 'lucide-react';
import type { QuestionNodeData } from '@/types';
import './nodes.css';

function QuestionNodeComponent({ data }: NodeProps) {
  const nodeData = data as QuestionNodeData;

  const timeStr = new Date(nodeData.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="node-card question-node">
      <div className="node-accent" />

      <Handle type="target" position={Position.Top} id="target" />

      <div className="node-header">
        <div className="node-icon">
          <MessageCircleQuestion size={14} />
        </div>
        <span>Question</span>
      </div>

      <div className="node-body">
        {nodeData.highlightedText && (
          <div className="highlighted-context">
            &ldquo;{nodeData.highlightedText}&rdquo;
          </div>
        )}
        <div className="question-text">{nodeData.content}</div>
      </div>

      <div className="node-footer">
        <span>{timeStr}</span>
        {nodeData.parentNodeId && (
          <span style={{ color: 'var(--cyan-400)' }}>↳ Branch</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  );
}

export const QuestionNode = memo(QuestionNodeComponent);
