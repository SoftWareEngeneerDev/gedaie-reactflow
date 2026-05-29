import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// ── Typage des données du nœud ────────────────────────────────────────────
interface EndData {
  message?: string;
}

export default function EndNode({ data, selected }: NodeProps) {
  const d = data as EndData;

  return (
    <div style={{
      background: '#F8FAFC',
      border: `2px solid ${selected ? '#475569' : '#94A3B8'}`,
      borderRadius: '12px',
      padding: '16px',
      minWidth: '220px',
      textAlign: 'center',
      boxShadow: selected ? '0 0 0 3px #CBD5E1' : '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <Handle type="target" position={Position.Top} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>🏁</span>
        <span style={{ fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
          Fin
        </span>
      </div>

      <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>
        {d.message || 'Fin du parcours'}
      </p>
    </div>
  );
}
