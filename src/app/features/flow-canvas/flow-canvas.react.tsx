import React from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
// @ts-ignore -- allow side-effect CSS import without type declarations
import '@xyflow/react/dist/style.css';

// Nœuds initiaux
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 100 },
    data: { label: '🟢 Départ' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 250, y: 250 },
    data: { label: '⚙️ Traitement' },
  },
  {
    id: '3',
    position: { x: 250, y: 400 },
    data: { label: '🔴 Fin' },
    type: 'output',
  },
];

// Connexions entre nœuds
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export default function FlowCanvasReact() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
