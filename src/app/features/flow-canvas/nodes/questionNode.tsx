import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// ── Typage des données du nœud ────────────────────────────────────────────
interface QuestionData {
  question?: string;
  options?: { label: string; nextNodeId?: string }[];
}

export default function QuestionNode({ data, selected }: NodeProps) {
  // Cast data vers l'interface typée — évite les erreurs TS4111
  const d = data as QuestionData;

  return (
    <div style={{
      background: '#EFF6FF',
      border: `2px solid ${selected ? '#1D4ED8' : '#3B82F6'}`,
      borderRadius: '12px',
      padding: '16px',
      minWidth: '220px',
      boxShadow: selected ? '0 0 0 3px #BFDBFE' : '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      {/* Point d'entrée (haut) */}
      <Handle type="target" position={Position.Top} />

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px' }}>❓</span>
        <span style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '12px', textTransform: 'uppercase' }}>
          Question
        </span>
      </div>

      {/* Texte de la question */}
      <p style={{ margin: 0, color: '#1E3A5F', fontSize: '14px', fontWeight: 500 }}>
        {d.question || 'Saisir une question...'}
      </p>

      {/* Options de réponse */}
      {Array.isArray(d.options) && d.options.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {d.options.map((opt, i) => (
            <span key={i} style={{
              background: '#DBEAFE', color: '#1D4ED8',
              borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 500,
            }}>
              {opt.label}
            </span>
          ))}
        </div>
      )}

      {/* Point de sortie (bas) */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
