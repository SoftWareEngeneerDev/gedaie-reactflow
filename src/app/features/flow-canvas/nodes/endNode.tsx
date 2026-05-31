import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface EndData {
  message?: string;
}

const COLOR = '#434655';

export default function EndNode({ data, selected }: NodeProps) {
  const d = data as EndData;

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: COLOR, width: '12px', height: '12px', border: '2px solid #fff', boxShadow: '0 0 0 4px rgba(67,70,85,0.12)', top: '-6px' }}
      />

      <div style={{
        background:   '#ffffff',
        border:       `1.5px solid ${selected ? COLOR : 'rgba(195,198,215,0.6)'}`,
        borderRadius: '16px',
        minWidth:     '200px',
        maxWidth:     '260px',
        overflow:     'hidden',
        boxShadow:    selected
          ? '0 0 0 3px rgba(67,70,85,0.15), 0 10px 15px rgba(67,70,85,0.08)'
          : '0 4px 6px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        transition:   'box-shadow 0.15s, border-color 0.15s',
      }}>

        {/* Header */}
        <div style={{ background: 'rgba(67,70,85,0.05)', borderBottom: '1px solid rgba(195,198,215,0.3)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: COLOR }}>flag</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fin</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'rgba(67,70,85,0.4)', cursor: 'default' }}>drag_indicator</span>
        </div>

        {/* Contenu */}
        <div style={{ padding: '14px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#0b1c30', lineHeight: '1.4' }}>
            {d.message || <span style={{ color: '#737686', fontStyle: 'italic' }}>Fin du parcours…</span>}
          </p>
        </div>

        {/* Footer strip (no source handle for end nodes) */}
        <div style={{ background: 'rgba(239,244,255,0.5)', borderTop: '1px solid rgba(195,198,215,0.3)', height: '16px' }} />
      </div>
    </div>
  );
}
