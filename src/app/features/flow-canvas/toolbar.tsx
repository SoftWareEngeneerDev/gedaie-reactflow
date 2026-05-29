import React from 'react';

// ── Configuration des types de nœuds disponibles ──────────────────────────
const NODE_TYPES = [
  {
    type:  'question',
    label: 'Question',
    emoji: '❓',
    color: '#1D4ED8',
    bg:    '#EFF6FF',
    border:'#3B82F6',
    description: 'Pose une question',
  },
  {
    type:  'solution',
    label: 'Solution',
    emoji: '✅',
    color: '#15803D',
    bg:    '#F0FDF4',
    border:'#22C55E',
    description: 'Affiche une réponse',
  },
  {
    type:  'ticket',
    label: 'Ticket',
    emoji: '🎫',
    color: '#C2410C',
    bg:    '#FFF7ED',
    border:'#F97316',
    description: 'Crée un ticket',
  },
  {
    type:  'end',
    label: 'Fin',
    emoji: '🏁',
    color: '#475569',
    bg:    '#F8FAFC',
    border:'#94A3B8',
    description: 'Termine le parcours',
  },
];

export default function Toolbar() {
  // Au début du drag, on stocke le type du nœud dans dataTransfer
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{
      width: '180px',
      minWidth: '180px',
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      zIndex: 10,
    }}>
      {/* Titre */}
      <p style={{
        margin: '0 0 8px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Nœuds disponibles
      </p>

      {/* Séparateur */}
      <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '0 0 4px' }} />

      {/* Liste des nœuds draggables */}
      {NODE_TYPES.map((node) => (
        <div
          key={node.type}
          draggable
          onDragStart={(e) => onDragStart(e, node.type)}
          title={`Glisser pour ajouter : ${node.label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: node.bg,
            border: `1.5px solid ${node.border}`,
            borderRadius: '10px',
            cursor: 'grab',
            userSelect: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 12px ${node.border}40`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '20px' }}>{node.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: node.color }}>
              {node.label}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
              {node.description}
            </div>
          </div>
        </div>
      ))}

      {/* Aide */}
      <div style={{
        marginTop: 'auto',
        padding: '10px',
        background: '#F8FAFC',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#94A3B8',
        lineHeight: '1.5',
      }}>
        💡 <strong>Glisse</strong> un nœud sur le canvas pour l'ajouter.
        <br /><br />
        🔗 <strong>Relie</strong> deux nœuds en tirant depuis un point de connexion.
      </div>
    </aside>
  );
}
