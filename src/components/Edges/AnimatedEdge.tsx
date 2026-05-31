'use client';

import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: EdgeProps) {
  const isBranch = data?.isBranch;
  const isStreaming = data?.isStreaming;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 20,
  });

  const edgeColor = isBranch ? '#06b6d4' : '#8b5cf6';
  const glowColor = isBranch
    ? 'rgba(6, 182, 212, 0.4)'
    : 'rgba(139, 92, 246, 0.4)';

  return (
    <>
      {/* Glow layer */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: glowColor,
          strokeWidth: isStreaming ? 6 : 4,
          filter: 'blur(4px)',
          ...style,
        }}
      />

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: 2,
          strokeDasharray: isStreaming ? '8 4' : 'none',
          animation: isStreaming
            ? 'flowDots 0.8s linear infinite'
            : 'none',
          ...style,
        }}
      />
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
