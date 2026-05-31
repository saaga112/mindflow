'use client';

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  LayoutGrid,
  Maximize2,
  StickyNote,
  Settings,
  Workflow,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { useSettingsStore } from '@/store/settingsStore';
import './Toolbar.css';

import { signIn, signOut, useSession } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

interface ToolbarProps {
  onOpenSettings: () => void;
}

export function Toolbar({ onOpenSettings }: ToolbarProps) {
  const { data: session } = useSession();
  const reactFlowInstance = useReactFlow();
  const autoLayout = useFlowStore((s) => s.autoLayout);
  const addNoteNode = useFlowStore((s) => s.addNoteNode);
  const autoLayoutEnabled = useSettingsStore((s) => s.autoLayoutEnabled);
  const toggleAutoLayout = useSettingsStore((s) => s.toggleAutoLayout);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
  }, [reactFlowInstance]);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn({ duration: 300 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut({ duration: 300 });
  }, [reactFlowInstance]);

  const handleAddNote = useCallback(() => {
    const viewport = reactFlowInstance.getViewport();
    const centerX = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
    const centerY = (-viewport.y + window.innerHeight / 2) / viewport.zoom;
    addNoteNode('', { x: centerX - 110, y: centerY - 80 });
  }, [reactFlowInstance, addNoteNode]);

  return (
    <div className="toolbar" id="main-toolbar">
      <div className="toolbar-brand">
        <div className="toolbar-brand-icon">
          <Workflow size={14} />
        </div>
        MindFlow
      </div>

      <div className="toolbar-divider" />

      <button
        className="btn btn-ghost btn-icon"
        onClick={handleAddNote}
        title="Add Note (sticky note)"
      >
        <StickyNote size={16} />
      </button>

      <button
        className={`btn btn-ghost btn-icon ${autoLayoutEnabled ? 'active' : ''}`}
        onClick={toggleAutoLayout}
        title={`Auto Layout: ${autoLayoutEnabled ? 'ON' : 'OFF'}`}
      >
        <LayoutGrid size={16} />
      </button>

      <button
        className="btn btn-ghost btn-icon"
        onClick={() => autoLayout()}
        title="Re-arrange nodes"
      >
        <Workflow size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        className="btn btn-ghost btn-icon"
        onClick={handleZoomOut}
        title="Zoom out"
      >
        <ZoomOut size={16} />
      </button>

      <button
        className="btn btn-ghost btn-icon"
        onClick={handleZoomIn}
        title="Zoom in"
      >
        <ZoomIn size={16} />
      </button>

      <button
        className="btn btn-ghost btn-icon"
        onClick={handleFitView}
        title="Fit to view"
      >
        <Maximize2 size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        className="btn btn-ghost btn-icon"
        onClick={onOpenSettings}
        title="Settings"
      >
        <Settings size={16} />
      </button>

      <div className="toolbar-divider" />

      {session ? (
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => signOut()}
          title={`Sign out (${session.user?.name || session.user?.email})`}
        >
          <LogOut size={16} />
        </button>
      ) : (
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => signIn()}
          title="Sign in to use AI features"
        >
          <LogIn size={16} />
        </button>
      )}
    </div>
  );
}
