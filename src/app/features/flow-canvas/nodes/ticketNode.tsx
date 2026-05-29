import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// ── Typage des données du nœud ────────────────────────────────────────────
interface TicketData {
  message?:  string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    '#FEF9C3',
  medium: '#FEF3C7',
  high:   '#FEE2E2',
};

export default function TicketNode({ data, selected }: NodeProps) {
  const d        = data as TicketData;
  const priority = d.priority ?? 'medium';

  return (
    <div style={{
      background: '#FFF7ED',
      border: `2px solid ${selected ? '#C2410C' : '#F97316'}`,
      borderRadius: '12px',
      padding: '16px',
      minWidth: '220px',
      boxShadow: selected ? '0 0 0 3px #FED7AA' : '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <Handle type="target" position={Position.Top} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px' }}>🎫</span>
        <span style={{ fontWeight: 700, color: '#C2410C', fontSize: '12px', textTransform: 'uppercase' }}>
          Ticket
        </span>
      </div>

      <p style={{ margin: 0, color: '#7C2D12', fontSize: '14px', fontWeight: 500 }}>
        {d.message || 'Créer un ticket support'}
      </p>

      <div style={{
        marginTop: '10px',
        display: 'inline-block',
        background: PRIORITY_COLORS[priority],
        borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600, color: '#92400E',
      }}>
        Priorité : {priority}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
