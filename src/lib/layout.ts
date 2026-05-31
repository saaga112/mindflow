import dagre from '@dagrejs/dagre';
import type { MindFlowNode, MindFlowEdge } from '@/types';

const NODE_WIDTH = 420;
const NODE_HEIGHT_QUESTION = 120;
const NODE_HEIGHT_ANSWER = 280;
const NODE_HEIGHT_NOTE = 160;

function getNodeHeight(node: MindFlowNode): number {
  const data = node.data;
  if (!data) return 200;
  switch (data.type) {
    case 'question':
      return NODE_HEIGHT_QUESTION;
    case 'answer': {
      const contentLength = data.content?.length || 0;
      return Math.max(NODE_HEIGHT_ANSWER, Math.min(600, contentLength / 2));
    }
    case 'note':
      return NODE_HEIGHT_NOTE;
    default:
      return 200;
  }
}

export function getLayoutedElements(
  nodes: MindFlowNode[],
  edges: MindFlowEdge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: MindFlowNode[]; edges: MindFlowEdge[] } {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: NODE_WIDTH,
      height: getNodeHeight(node),
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const gNode = g.node(node.id);
    return {
      ...node,
      position: {
        x: gNode.x - NODE_WIDTH / 2,
        y: gNode.y - getNodeHeight(node) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
