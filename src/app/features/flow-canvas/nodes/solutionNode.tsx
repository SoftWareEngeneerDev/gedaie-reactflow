import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// ── Typage des données du nœud ────────────────────────────────────────────
interface SolutionData {
  title?:   string;
  message?: string;
  steps?:   string[];
}

export default function SolutionNode({ data, selected }: NodeProps) {
  const d = data as SolutionData;

  return (
    <div style={{
      background: '#F0FDF4',
      border: `2px solid ${selected ? '#15803D' : '#22C55E'}`,
      borderRadius: '12px',
      padding: '16px',
      minWidth: '220px',
      boxShadow: selected ? '0 0 0 3px #BBF7D0' : '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <Handle type="target" position={Position.Top} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px' }}>✅</span>
        <span style={{ fontWeight: 700, color: '#15803D', fontSize: '12px', textTransform: 'uppercase' }}>
          Solution
        </span>
      </div>

      <p style={{ margin: 0, color: '#14532D', fontSize: '14px', fontWeight: 600 }}>
        {d.title || 'Titre de la solution'}
      </p>

      {d.message && (
        <p style={{ margin: '6px 0 0', color: '#166534', fontSize: '13px' }}>
          {d.message}
        </p>
      )}

      {Array.isArray(d.steps) && d.steps.length > 0 && (
        <ol style={{ margin: '8px 0 0', paddingLeft: '16px', color: '#166534', fontSize: '12px' }}>
          {d.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
