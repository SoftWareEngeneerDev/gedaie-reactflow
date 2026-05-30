import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// ── Typage des données du nœud ────────────────────────────────────────────
interface QuestionData {
  question?: string;
  options?: { label: string; nextNodeId?: string }[];
}

export default function QuestionNode({ data, selected }: NodeProps) {
  const d = data as QuestionData;
  const options = Array.isArray(d.options) && d.options.length > 0 ? d.options : [];

  // ── Position des handles de sortie (répartis en bas) ──────────────────
  // Ex : 3 options → 17%, 50%, 83%  |  2 options → 25%, 75%  |  1 → 50%
  const handleLeft = (i: number, total: number): string => {
    if (total === 1) return '50%';
    const pct = 10 + (i / (total - 1)) * 80;
    return `${pct}%`;
  };

  return (
    <div style={{
      background:   '#EFF6FF',
      border:       `2px solid ${selected ? '#1D4ED8' : '#3B82F6'}`,
      borderRadius: '12px',
      padding:      '16px 16px 28px 16px',   // padding-bottom pour laisser la place aux handles
      minWidth:     '220px',
      boxShadow:    selected ? '0 0 0 3px #BFDBFE' : '0 2px 8px rgba(0,0,0,0.1)',
      position:     'relative',
    }}>

      {/* Handle d'entrée (haut) */}
      <Handle type="target" position={Position.Top} />

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px' }}>❓</span>
        <span style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '12px', textTransform: 'uppercase' }}>
          Question
        </span>
      </div>

      {/* Texte de la question */}
      <p style={{ margin: '0 0 10px 0', color: '#1E3A5F', fontSize: '14px', fontWeight: 500, lineHeight: '1.4' }}>
        {d.question || 'Saisir une question...'}
      </p>

      {/* Options — badges avec indication du handle en dessous */}
      {options.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
          {options.map((opt, i) => (
            <span key={i} style={{
              background:   '#DBEAFE',
              color:        '#1D4ED8',
              borderRadius: '20px',
              padding:      '2px 10px',
              fontSize:     '12px',
              fontWeight:   500,
              // Petite flèche visuelle vers le bas pour indiquer le handle
              borderBottom: '2px solid #3B82F6',
            }}>
              {opt.label}
            </span>
          ))}
        </div>
      )}

      {/* ── Handles de sortie — un par option ─────────────────────────────
           Chaque handle porte l'id = label de l'option.
           onConnect dans flow-canvas.react.tsx lit connection.sourceHandle
           pour assigner automatiquement le bon label à l'arête créée.      */}
      {options.length > 0
        ? options.map((opt, i) => (
            <Handle
              key={`src-${i}`}
              type="source"
              position={Position.Bottom}
              id={opt.label}          // ← id = label exact de l'option
              style={{
                left:       handleLeft(i, options.length),
                bottom:     '-8px',
                background: '#3B82F6',
                width:      '10px',
                height:     '10px',
                border:     '2px solid #FFFFFF',
              }}
              title={`Connecter vers : ${opt.label}`}
            />
          ))
        : /* Nœud sans options : handle de sortie unique */
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#3B82F6', width: '10px', height: '10px', border: '2px solid #FFFFFF' }}
          />
      }
    </div>
  );
}
