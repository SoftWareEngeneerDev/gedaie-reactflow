import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface QuestionData {
  question?: string;
  options?:  { label: string; nextNodeId?: string }[];
}

const COLOR = '#004ac6';

const handleLeft = (i: number, total: number): string => {
  if (total === 1) return '50%';
  const pct = 15 + (i / (total - 1)) * 70;
  return `${pct}%`;
};

export default function QuestionNode({ data, selected }: NodeProps) {
  const d       = data as QuestionData;
  const options = Array.isArray(d.options) && d.options.length > 0 ? d.options : [];

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Handle d'entrée (haut) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: COLOR, width: '12px', height: '12px', border: '2px solid #fff', boxShadow: '0 0 0 4px rgba(0,74,198,0.12)', top: '-6px' }}
      />

      {/* Carte visuelle */}
      <div style={{
        background:   '#ffffff',
        border:       `1.5px solid ${selected ? '#2563eb' : 'rgba(195,198,215,0.6)'}`,
        borderRadius: '16px',
        minWidth:     '240px',
        maxWidth:     '280px',
        overflow:     'hidden',
        boxShadow:    selected
          ? '0 0 0 3px rgba(37,99,235,0.15), 0 10px 15px rgba(37,99,235,0.1)'
          : '0 4px 6px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        transition:   'box-shadow 0.15s, border-color 0.15s',
      }}>

        {/* Header */}
        <div style={{ background: 'rgba(0,74,198,0.05)', borderBottom: '1px solid rgba(195,198,215,0.3)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: COLOR }}>help</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: COLOR, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Question</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'rgba(67,70,85,0.4)', cursor: 'default' }}>drag_indicator</span>
        </div>

        {/* Contenu */}
        <div style={{ padding: '14px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 600, fontSize: '13px', color: '#0b1c30', lineHeight: '1.4' }}>
            {d.question || <span style={{ color: '#737686', fontStyle: 'italic', fontWeight: 400 }}>Saisir une question…</span>}
          </p>
          {options.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {options.map((opt, i) => (
                <span key={i} style={{ padding: '3px 10px', background: '#eff4ff', border: '1px solid rgba(195,198,215,0.4)', borderRadius: '8px', fontSize: '10px', color: '#434655', fontWeight: 500 }}>
                  {opt.label || `…`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer visuel (fond du strip) */}
        <div style={{ background: 'rgba(239,244,255,0.5)', borderTop: '1px solid rgba(195,198,215,0.3)', height: '32px' }} />
      </div>

      {/* Handles de sortie (positionnés dans le footer strip) */}
      {options.length > 0
        ? options.map((opt, i) => (
            <Handle
              key={`src-${i}`}
              type="source"
              position={Position.Bottom}
              id={`option-${i}`}
              style={{
                left:      handleLeft(i, options.length),
                bottom:    '16px',
                background: COLOR,
                width:     '12px',
                height:    '12px',
                border:    '2px solid #ffffff',
                boxShadow: '0 0 0 4px rgba(0,74,198,0.12)',
              }}
              title={`Connecter : ${opt.label}`}
            />
          ))
        : <Handle
            type="source"
            position={Position.Bottom}
            style={{ left: '50%', bottom: '16px', background: COLOR, width: '12px', height: '12px', border: '2px solid #fff', boxShadow: '0 0 0 4px rgba(0,74,198,0.12)' }}
          />
      }
    </div>
  );
}
