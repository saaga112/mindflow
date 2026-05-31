'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvas } from '@/components/Canvas/FlowCanvas';

export default function Home() {
  return (
    <main>
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </main>
  );
}
