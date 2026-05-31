import React, { useState } from 'react';
import type { TreeSummary } from './topBar';

// ── Tokens ────────────────────────────────────────────────────────────────
const C = {
  primary:             '#004ac6',
  surface:             '#ffffff',
  surfaceContainer:    '#e5eeff',
  surfaceContainerLow: '#eff4ff',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#434655',
  outlineVariant:      '#c3c6d7',
  outline:             '#737686',
  secondary:           '#006c49',
  tertiary:            '#784b00',
};

// ── Configuration des nœuds ────────────────────────────────────────────────
const NODE_TYPES = [
  { type: 'question', label: 'Question', desc: 'Pose une question',      icon: 'help',                hoverColor: C.primary,   hoverShadow: 'rgba(0,74,198,0.08)'   },
  { type: 'solution', label: 'Solution', desc: 'Affiche une réponse',    icon: 'check_circle',        hoverColor: C.secondary, hoverShadow: 'rgba(0,108,73,0.08)'   },
  { type: 'ticket',   label: 'Ticket',   desc: 'Crée un ticket',         icon: 'confirmation_number', hoverColor: C.tertiary,  hoverShadow: 'rgba(120,75,0,0.08)'   },
  { type: 'end',      label: 'Fin',      desc: 'Termine le parcours',    icon: 'flag',                hoverColor: C.outline,   hoverShadow: 'rgba(115,118,134,0.08)' },
];

// ── Composant NodeCard ─────────────────────────────────────────────────────
function NodeCard({ node, onDragStart }: {
  node: typeof NODE_TYPES[0];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, type: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, node.type)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Glisser pour ajouter : ${node.label}`}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '16px',
        padding:      '16px',
        background:   C.surface,
        border:       `1px solid ${hovered ? node.hoverColor : C.outlineVariant}`,
        borderRadius: '16px',
        cursor:       'grab',
        userSelect:   'none',
        transition:   'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        transform:    hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow:    hovered ? `0 8px 16px ${node.hoverShadow}` : 'none',
      }}
    >
      {/* Icône */}
      <div style={{
        width:          '40px',
        height:         '40px',
        borderRadius:   '12px',
        background:     hovered ? node.hoverColor : `${node.hoverColor}1a`,
        color:          hovered ? '#ffffff' : node.hoverColor,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        transition:     'background 0.2s, color 0.2s',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{node.icon}</span>
      </div>

      {/* Texte */}
      <div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: C.onSurface, lineHeight: 1.2 }}>{node.label}</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: C.outline, lineHeight: 1.3 }}>{node.desc}</p>
      </div>
    </div>
  );
}

// ── Composant NavItem ──────────────────────────────────────────────────────
function NavItem({ icon, label }: { icon: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', color: hovered ? C.primary : C.onSurfaceVariant, cursor: 'pointer', borderRadius: '8px', transition: 'color 0.15s', background: hovered ? 'rgba(0,74,198,0.05)' : 'transparent' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────
interface ToolbarProps {
  treeName:    string;
  savedTrees:  TreeSummary[];
  onNameChange:(name: string) => void;
  onLoad:      (documentId: string) => void;
}

// ── Toolbar ────────────────────────────────────────────────────────────────
export default function Toolbar({ treeName, savedTrees, onNameChange, onLoad }: ToolbarProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{
      width:         '280px',
      minWidth:      '280px',
      height:        '100%',
      background:    C.surfaceContainerLow,
      borderRight:   `1px solid ${C.outlineVariant}`,
      display:       'flex',
      flexDirection: 'column',
      zIndex:        40,
      fontFamily:    'Inter, system-ui, sans-serif',
    }}>

      {/* ── Section Arbre ────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.outlineVariant}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Arbre en cours
        </p>
        {/* Nom */}
        <input
          value={treeName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Nom de l'arbre…"
          style={{ padding: '8px 12px', border: `1px solid ${C.outlineVariant}`, borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: C.onSurface, background: C.surface, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        {/* Charger */}
        {savedTrees.length > 0 && (
          <select
            value=""
            onChange={e => { if (e.target.value) onLoad(e.target.value); }}
            style={{ padding: '7px 10px', border: `1px solid ${C.outlineVariant}`, borderRadius: '8px', fontSize: '13px', color: C.onSurface, background: C.surface, cursor: 'pointer', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif', outline: 'none' }}
          >
            <option value="">📂 Charger un arbre…</option>
            {savedTrees.map(t => <option key={t.documentId} value={t.documentId}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* ── En-tête + Cards ───────────────────────────────────────────────── */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${C.outlineVariant}` }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 4px' }}>
          Nœuds disponibles
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NODE_TYPES.map(node => (
            <NodeCard key={node.type} node={node} onDragStart={onDragStart} />
          ))}
        </div>
      </div>

      {/* ── Info ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ background: C.surfaceContainer, padding: '16px', borderRadius: '12px', border: `1px solid ${C.outlineVariant}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.primary, flexShrink: 0 }}>info</span>
            <p style={{ margin: 0, fontSize: '13px', color: C.onSurface, lineHeight: '1.5' }}>
              Glisse un nœud sur le canvas pour l'ajouter.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.primary, flexShrink: 0 }}>link</span>
            <p style={{ margin: 0, fontSize: '13px', color: C.onSurface, lineHeight: '1.5' }}>
              Relie deux nœuds en tirant depuis un point.
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav liens bas ────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.outlineVariant}`, padding: '8px' }}>
        <NavItem icon="history"     label="Historique"     />
        <NavItem icon="description" label="Documentation"  />
      </div>
    </aside>
  );
}
