import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface TicketData {
  message?:  string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

const COLOR = '#784b00';

const PRIORITY: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Basse',   color: '#5f6002', bg: '#f5f6da' },
  medium: { label: 'Moyenne', color: '#784b00', bg: '#fdf0e0' },
  high:   { label: 'Haute',   color: '#ba1a1a', bg: '#ffdad6' },
};

export default function TicketNode({ data, selected }: NodeProps) {
  const d        = data as TicketData;
  const priority = d.priority ?? 'medium';
  const p        = PRIORITY[priority] ?? PRIORITY['medium'];

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: COLOR, width: '12px', height: '12px', border: '2px solid #fff', boxShadow: '0 0 0 4px rgba(120,75,0,0.12)', top: '-6px' }}
      />

      <div style={{
        background:   '#ffffff',
        border:       `1.5px solid ${selected ? COLOR : 'rgba(195,198,215,0.6)'}`,
        borderRadius: '16px',
        minWidth:     '240px',
        maxWidth:     '280px',
        overflow:     'hidden',
        boxShadow:    selected
          ? '0 0 0 3px rgba(120,75,0,0.15), 0 10px 15px rgba(120,75,0,0.1)'
          : '0 4px 6px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        transition:   'box-shadow 0.15s, border-color 0.15s',
      }}>

        {/* Header */}
        <div style={{ background: 'rgba(120,75,0,0.05)', borderBottom: '1px solid rgba(195,198,215,0.3)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: COLOR }}>confirmation_number</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ticket</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'rgba(67,70,85,0.4)', cursor: 'default' }}>drag_indicator</span>
        </div>

        {/* Contenu */}
        <div style={{ padding: '14px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 500, fontSize: '13px', color: '#0b1c30', lineHeight: '1.4' }}>
            {d.message || <span style={{ color: '#737686', fontStyle: 'italic', fontWeight: 400 }}>Créer un ticket support…</span>}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: p.bg, color: p.color, borderRadius: '8px', fontSize: '10px', fontWeight: 700 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>priority_high</span>
              {p.label}
            </span>
            {d.category && (
              <span style={{ padding: '3px 10px', background: '#eff4ff', border: '1px solid rgba(195,198,215,0.4)', borderRadius: '8px', fontSize: '10px', color: '#434655', fontWeight: 500 }}>
                {d.category}
              </span>
            )}
          </div>
        </div>

        {/* Footer strip */}
        <div style={{ background: 'rgba(253,240,224,0.5)', borderTop: '1px solid rgba(195,198,215,0.3)', height: '32px' }} />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: '50%', bottom: '16px', background: COLOR, width: '12px', height: '12px', border: '2px solid #fff', boxShadow: '0 0 0 4px rgba(120,75,0,0.12)' }}
      />
    </div>
  );
}
