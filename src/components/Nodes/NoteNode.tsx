'use client';

import { memo, useCallback } from 'react';
import { type NodeProps } from '@xyflow/react';
import { StickyNote, Trash2 } from 'lucide-react';
import type { NoteNodeData } from '@/types';
import { useFlowStore } from '@/store/flowStore';
import './nodes.css';

function NoteNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as NoteNodeData;
  const updateNoteContent = useFlowStore((s) => s.updateNoteContent);
  const deleteNode = useFlowStore((s) => s.deleteNode);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNoteContent(id, e.target.value);
    },
    [id, updateNoteContent]
  );

  return (
    <div className="node-card note-node">
      <div className="node-accent" />

      <div className="node-header">
        <div className="node-icon">
          <StickyNote size={14} />
        </div>
        <span>Note</span>
        <button
          onClick={() => deleteNode(id)}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            padding: 2,
          }}
          title="Delete note"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="node-body nodrag">
        <textarea
          value={nodeData.content}
          onChange={handleChange}
          placeholder="Type your notes here..."
          className="nowheel"
        />
      </div>
    </div>
  );
}

export const NoteNode = memo(NoteNodeComponent);
