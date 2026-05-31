import React from 'react';
import { Node, Edge } from '@xyflow/react';

// ── Interfaces ────────────────────────────────────────────────────────────
interface QuestionData { question?: string; options?: { label: string; nextNodeId?: string }[]; }
interface SolutionData { title?: string; message?: string; steps?: string[]; }
interface TicketData   { message?: string; priority?: 'low' | 'medium' | 'high'; category?: string; }
interface EndData      { message?: string; }

interface Props {
  node:              Node | null;
  edge:              Edge | null;
  onChange:          (nodeId: string, newData: Record<string, unknown>) => void;
  onDelete:          (nodeId: string) => void;
  onEdgeLabelChange: (edgeId: string, label: string) => void;
  onEdgeDelete:      (edgeId: string) => void;
  onClose?:          () => void;
}

// ── Tokens ────────────────────────────────────────────────────────────────
const C = {
  primary:             '#004ac6',
  secondary:           '#006c49',
  tertiary:            '#784b00',
  surface:             '#ffffff',
  surfaceContainerLow: '#eff4ff',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#434655',
  outlineVariant:      '#c3c6d7',
  outline:             '#737686',
  error:               '#ba1a1a',
  errorBg:             'rgba(186,26,26,0.05)',
};

// ── Styles de base ────────────────────────────────────────────────────────
const inputS: React.CSSProperties = {
  width:       '100%',
  padding:     '10px 12px',
  border:      `1px solid ${C.outlineVariant}`,
  borderRadius:'12px',
  fontSize:    '13px',
  color:       C.onSurface,
  background:  C.surfaceContainerLow,
  boxSizing:   'border-box',
  outline:     'none',
  fontFamily:  'Inter, system-ui, sans-serif',
  lineHeight:  '1.4',
  resize:      'none' as const,
};

// ── Section header ────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize:      '11px', fontWeight: 700, color: C.onSurfaceVariant,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      background:    'rgba(239,244,255,0.5)',
      padding:       '6px 20px', margin: '0 -20px',
      borderRadius:  '8px', marginBottom: '12px',
    }}>
      {children}
    </div>
  );
}

// ── FieldLabel ────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 500, color: C.onSurfaceVariant }}>
      {children}
    </p>
  );
}

// ── QuestionForm ──────────────────────────────────────────────────────────
function QuestionForm({ data, onChange }: { data: QuestionData; onChange: (d: QuestionData) => void }) {
  const options = data.options ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Section Contenu */}
      <section>
        <SectionTitle>Contenu</SectionTitle>
        <div>
          <FieldLabel>TEXTE DE LA QUESTION</FieldLabel>
          <textarea
            style={{ ...inputS, minHeight: '96px' }}
            value={data.question ?? ''}
            onChange={e => onChange({ ...data, question: e.target.value })}
            placeholder="Posez votre question ici..."
          />
        </div>
      </section>

      {/* Section Options */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <SectionTitle>Options de réponse</SectionTitle>
          <button
            onClick={() => onChange({ ...data, options: [...options, { label: '' }] })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', border: '1px solid rgba(0,74,198,0.2)', borderRadius: '8px', color: C.primary, fontSize: '11px', fontWeight: 700, background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
            Ajouter
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                style={{ ...inputS, flex: 1, padding: '10px 12px' }}
                value={opt.label}
                placeholder={`Option ${i + 1}`}
                onChange={e => {
                  const updated = options.map((o, idx) => idx === i ? { ...o, label: e.target.value } : o);
                  onChange({ ...data, options: updated });
                }}
              />
              <button
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(186,26,26,0.08)', color: C.error, border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => onChange({ ...data, options: options.filter((_, idx) => idx !== i) })}
                title="Supprimer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── SolutionForm ──────────────────────────────────────────────────────────
function SolutionForm({ data, onChange }: { data: SolutionData; onChange: (d: SolutionData) => void }) {
  const steps = data.steps ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section>
        <SectionTitle>Contenu</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <FieldLabel>TITRE</FieldLabel>
            <input style={inputS} value={data.title ?? ''} placeholder="Ex : Redémarrer l'appareil" onChange={e => onChange({ ...data, title: e.target.value })} />
          </div>
          <div>
            <FieldLabel>MESSAGE</FieldLabel>
            <textarea style={{ ...inputS, minHeight: '80px' }} value={data.message ?? ''} placeholder="Description de la solution..." onChange={e => onChange({ ...data, message: e.target.value })} />
          </div>
        </div>
      </section>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <SectionTitle>Étapes (optionnel)</SectionTitle>
          <button onClick={() => onChange({ ...data, steps: [...steps, ''] })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', border: '1px solid rgba(0,108,73,0.2)', borderRadius: '8px', color: C.secondary, fontSize: '11px', fontWeight: 700, background: 'transparent', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Ajouter
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input style={{ ...inputS, flex: 1 }} value={step} placeholder={`Étape ${i + 1}`} onChange={e => { const u = steps.map((s, idx) => idx === i ? e.target.value : s); onChange({ ...data, steps: u }); }} />
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(186,26,26,0.08)', color: C.error, border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => onChange({ ...data, steps: steps.filter((_, idx) => idx !== i) })}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── TicketForm ────────────────────────────────────────────────────────────
function TicketForm({ data, onChange }: { data: TicketData; onChange: (d: TicketData) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section>
        <SectionTitle>Contenu</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <FieldLabel>MESSAGE</FieldLabel>
            <textarea style={{ ...inputS, minHeight: '80px' }} value={data.message ?? ''} placeholder="Ex : Ce problème nécessite une intervention." onChange={e => onChange({ ...data, message: e.target.value })} />
          </div>
          <div>
            <FieldLabel>PRIORITÉ</FieldLabel>
            <select style={{ ...inputS, cursor: 'pointer' }} value={data.priority ?? 'medium'} onChange={e => onChange({ ...data, priority: e.target.value as TicketData['priority'] })}>
              <option value="low">🟡 Basse (Low)</option>
              <option value="medium">🟠 Moyenne (Medium)</option>
              <option value="high">🔴 Haute (High)</option>
            </select>
          </div>
          <div>
            <FieldLabel>CATÉGORIE</FieldLabel>
            <input style={inputS} value={data.category ?? ''} placeholder="Ex : hardware, software..." onChange={e => onChange({ ...data, category: e.target.value })} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ── EndForm ───────────────────────────────────────────────────────────────
function EndForm({ data, onChange }: { data: EndData; onChange: (d: EndData) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section>
        <SectionTitle>Contenu</SectionTitle>
        <div>
          <FieldLabel>MESSAGE DE FIN</FieldLabel>
          <textarea style={{ ...inputS, minHeight: '96px' }} value={data.message ?? ''} placeholder="Ex : Merci d'avoir utilisé la FAQ !" onChange={e => onChange({ ...data, message: e.target.value })} />
        </div>
      </section>
    </div>
  );
}

// ── Méta par type ─────────────────────────────────────────────────────────
const NODE_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  question: { icon: 'help',                label: 'Question', color: '#004ac6', bg: 'rgba(0,74,198,0.1)'   },
  solution: { icon: 'check_circle',        label: 'Solution', color: '#006c49', bg: 'rgba(0,108,73,0.1)'   },
  ticket:   { icon: 'confirmation_number', label: 'Ticket',   color: '#784b00', bg: 'rgba(120,75,0,0.1)'   },
  end:      { icon: 'flag',               label: 'Fin',      color: '#434655', bg: 'rgba(67,70,85,0.1)'   },
};

// ── Panneau principal ─────────────────────────────────────────────────────
export default function NodeConfigPanel({ node, edge, onChange, onDelete, onEdgeLabelChange, onEdgeDelete, onClose }: Props) {

  const aside: React.CSSProperties = {
    width:         '320px',
    minWidth:      '320px',
    background:    '#ffffff',
    borderLeft:    `1px solid ${C.outlineVariant}`,
    display:       'flex',
    flexDirection: 'column',
    boxShadow:     '-4px 0 24px rgba(0,0,0,0.06)',
    fontFamily:    'Inter, system-ui, sans-serif',
    zIndex:        40,
  };

  // ── Vide ─────────────────────────────────────────────────────────────────
  if (!node && !edge) {
    return (
      <aside style={{ ...aside, alignItems: 'center', justifyContent: 'center', gap: '12px', color: C.outline, fontSize: '13px', textAlign: 'center', padding: '32px 24px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: C.outlineVariant }}>touch_app</span>
        <p style={{ margin: 0, lineHeight: '1.6', color: C.onSurfaceVariant }}>
          Clique sur un <strong>nœud</strong><br />ou une <strong>flèche</strong> pour l'éditer
        </p>
      </aside>
    );
  }

  // ── Arête ─────────────────────────────────────────────────────────────────
  if (edge && !node) {
    const label    = typeof edge.label === 'string' ? edge.label : '';
    const hasLabel = label.trim().length > 0;
    return (
      <aside style={aside}>
        {/* Header */}
        <div style={{ padding: '16px 20px', background: C.surfaceContainerLow, borderBottom: `1px solid ${C.outlineVariant}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0,74,198,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.primary }}>east</span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: C.onSurface }}>Connexion</h2>
              <p style={{ margin: 0, fontSize: '10px', color: C.outline, fontFamily: 'JetBrains Mono, monospace' }}>{edge.id.slice(0, 22)}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          )}
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section>
            <SectionTitle>Trajet</SectionTitle>
            <div style={{ fontSize: '12px', color: C.onSurfaceVariant, background: C.surfaceContainerLow, padding: '10px 14px', borderRadius: '10px', fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.8', border: `1px solid ${C.outlineVariant}` }}>
              {edge.source}<br />
              <span style={{ color: C.outline }}>↓</span><br />
              {edge.target}
            </div>
          </section>
          <section>
            <SectionTitle>Label de l'option</SectionTitle>
            <input
              style={{ ...inputS, borderColor: hasLabel ? C.secondary : C.error }}
              value={label}
              placeholder="Ex: Oui, Non, Éteintes..."
              onChange={e => onEdgeLabelChange(edge.id, e.target.value)}
            />
            {!hasLabel ? (
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: C.error }}>⚠️ Sans label, la navigation FAQ est impossible.</p>
            ) : (
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: C.secondary }}>✅ La réponse «{label}» mène ici.</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow }}>
          <button onClick={() => onEdgeDelete(edge.id)}
            style={{ width: '100%', padding: '12px 0', background: C.errorBg, color: C.error, border: '1px solid rgba(186,26,26,0.2)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = C.error}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = C.errorBg}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            Supprimer cette flèche
          </button>
        </div>
      </aside>
    );
  }

  // ── Nœud ─────────────────────────────────────────────────────────────────
  const meta   = NODE_META[node!.type ?? ''] ?? { icon: 'square', label: 'Nœud', color: C.onSurfaceVariant, bg: 'rgba(67,70,85,0.1)' };
  const update = (d: Record<string, unknown>) => onChange(node!.id, d);

  return (
    <aside style={aside}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: C.surfaceContainerLow, borderBottom: `1px solid ${C.outlineVariant}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: meta.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: meta.color }}>{meta.icon}</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: C.onSurface }}>{meta.label}</h2>
            <p style={{ margin: 0, fontSize: '10px', color: C.outline, fontFamily: 'JetBrains Mono, monospace' }}>{node!.id}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        )}
      </div>

      {/* Formulaire */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {node!.type === 'question' && <QuestionForm data={node!.data as QuestionData} onChange={d => update(d as Record<string, unknown>)} />}
        {node!.type === 'solution' && <SolutionForm data={node!.data as SolutionData} onChange={d => update(d as Record<string, unknown>)} />}
        {node!.type === 'ticket'   && <TicketForm   data={node!.data as TicketData}   onChange={d => update(d as Record<string, unknown>)} />}
        {node!.type === 'end'      && <EndForm      data={node!.data as EndData}       onChange={d => update(d as Record<string, unknown>)} />}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.outlineVariant}`, background: C.surfaceContainerLow }}>
        <button
          onClick={() => onDelete(node!.id)}
          style={{ width: '100%', padding: '12px 0', background: C.errorBg, color: C.error, border: '1px solid rgba(186,26,26,0.2)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.error; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.errorBg; (e.currentTarget as HTMLButtonElement).style.color = C.error; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
          Supprimer ce nœud
        </button>
      </div>
    </aside>
  );
}
