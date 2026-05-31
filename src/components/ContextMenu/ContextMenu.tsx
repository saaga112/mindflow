'use client';

import { Trash2, Copy, GitBranch } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';

export function ContextMenu() {
  const contextMenu = useFlowStore((s) => s.contextMenu);
  const closeContextMenu = useFlowStore((s) => s.closeContextMenu);
  const deleteNode = useFlowStore((s) => s.deleteNode);

  if (!contextMenu.isOpen || !contextMenu.nodeId) return null;

  const handleDelete = () => {
    if (contextMenu.nodeId) {
      deleteNode(contextMenu.nodeId);
    }
    closeContextMenu();
  };

  const handleCopyId = () => {
    if (contextMenu.nodeId) {
      navigator.clipboard.writeText(contextMenu.nodeId);
    }
    closeContextMenu();
  };

  return (
    <>
      <style>{`
        .context-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: calc(var(--z-popover) - 1);
        }
        .context-menu {
          position: fixed;
          z-index: var(--z-popover);
          min-width: 180px;
          padding: var(--space-1);
          background: var(--glass-bg-strong);
          backdrop-filter: blur(var(--glass-blur-strong));
          -webkit-backdrop-filter: blur(var(--glass-blur-strong));
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xl);
          animation: fadeInScale 150ms var(--ease-spring);
        }
        .context-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          text-align: left;
        }
        .context-menu-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .context-menu-item.danger:hover {
          background: rgba(244, 63, 94, 0.1);
          color: var(--rose-400);
        }
        .context-menu-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: var(--space-1) var(--space-2);
        }
      `}</style>

      <div className="context-menu-overlay" onClick={closeContextMenu} />
      <div
        className="context-menu"
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <button className="context-menu-item" onClick={handleCopyId}>
          <Copy size={14} />
          Copy Node ID
        </button>
        <button className="context-menu-item" onClick={closeContextMenu}>
          <GitBranch size={14} />
          Create Branch
        </button>
        <div className="context-menu-divider" />
        <button className="context-menu-item danger" onClick={handleDelete}>
          <Trash2 size={14} />
          Delete Node
        </button>
      </div>
    </>
  );
}
