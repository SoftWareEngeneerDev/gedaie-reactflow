import React from 'react';
import { Node } from '@xyflow/react';

// ── Interfaces de données par type de nœud ────────────────────────────────
interface QuestionData {
  question?: string;
  options?:  { label: string; nextNodeId?: string }[];
}
interface SolutionData {
  title?:   string;
  message?: string;
  steps?:   string[];
}
interface TicketData {
  message?:  string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}
interface EndData {
  message?: string;
}

interface Props {
  node:     Node | null;
  onChange: (nodeId: string, newData: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
}

// ── Styles réutilisables ──────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#1E293B',
  background: '#F8FAFC',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '4px',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const btnStyle = (color: string, bg: string): React.CSSProperties => ({
  padding: '4px 10px',
  background: bg,
  color,
  border: `1px solid ${color}`,
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  lineHeight: '1.4',
});

// ── Formulaire Question ───────────────────────────────────────────────────
function QuestionForm({ data, onChange }: { data: QuestionData; onChange: (d: QuestionData) => void }) {
  const options = data.options ?? [];

  return (
    <div style={sectionStyle}>
      <div>
        <label style={labelStyle}>Question</label>
        <textarea
          style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
          value={data.question ?? ''}
          onChange={(e) => onChange({ ...data, question: e.target.value })}
          placeholder="Ex : Votre imprimante est-elle allumée ?"
        />
      </div>

      <div>
        <label style={labelStyle}>Options de réponse</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={opt.label}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => {
                  const updated = options.map((o, idx) =>
                    idx === i ? { ...o, label: e.target.value } : o
                  );
                  onChange({ ...data, options: updated });
                }}
              />
              <button
                style={btnStyle('#EF4444', '#FEF2F2')}
                onClick={() => onChange({ ...data, options: options.filter((_, idx) => idx !== i) })}
                title="Supprimer"
              >✕</button>
            </div>
          ))}
          <button
            style={btnStyle('#3B82F6', '#EFF6FF')}
            onClick={() => onChange({ ...data, options: [...options, { label: '' }] })}
          >
            + Ajouter une option
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire Solution ───────────────────────────────────────────────────
function SolutionForm({ data, onChange }: { data: SolutionData; onChange: (d: SolutionData) => void }) {
  const steps = data.steps ?? [];

  return (
    <div style={sectionStyle}>
      <div>
        <label style={labelStyle}>Titre</label>
        <input
          style={inputStyle}
          value={data.title ?? ''}
          placeholder="Ex : Redémarrer l'appareil"
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
          value={data.message ?? ''}
          placeholder="Description de la solution..."
          onChange={(e) => onChange({ ...data, message: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Étapes (optionnel)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={step}
                placeholder={`Étape ${i + 1}`}
                onChange={(e) => {
                  const updated = steps.map((s, idx) => idx === i ? e.target.value : s);
                  onChange({ ...data, steps: updated });
                }}
              />
              <button
                style={btnStyle('#EF4444', '#FEF2F2')}
                onClick={() => onChange({ ...data, steps: steps.filter((_, idx) => idx !== i) })}
              >✕</button>
            </div>
          ))}
          <button
            style={btnStyle('#22C55E', '#F0FDF4')}
            onClick={() => onChange({ ...data, steps: [...steps, ''] })}
          >
            + Ajouter une étape
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire Ticket ─────────────────────────────────────────────────────
function TicketForm({ data, onChange }: { data: TicketData; onChange: (d: TicketData) => void }) {
  return (
    <div style={sectionStyle}>
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
          value={data.message ?? ''}
          placeholder="Ex : Ce problème nécessite une intervention."
          onChange={(e) => onChange({ ...data, message: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Priorité</label>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={data.priority ?? 'medium'}
          onChange={(e) => onChange({ ...data, priority: e.target.value as TicketData['priority'] })}
        >
          <option value="low">🟡 Basse (Low)</option>
          <option value="medium">🟠 Moyenne (Medium)</option>
          <option value="high">🔴 Haute (High)</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Catégorie</label>
        <input
          style={inputStyle}
          value={data.category ?? ''}
          placeholder="Ex : hardware, software, réseau..."
          onChange={(e) => onChange({ ...data, category: e.target.value })}
        />
      </div>
    </div>
  );
}

// ── Formulaire End ────────────────────────────────────────────────────────
function EndForm({ data, onChange }: { data: EndData; onChange: (d: EndData) => void }) {
  return (
    <div style={sectionStyle}>
      <div>
        <label style={labelStyle}>Message de fin</label>
        <textarea
          style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
          value={data.message ?? ''}
          placeholder="Ex : Merci d'avoir utilisé la FAQ !"
          onChange={(e) => onChange({ ...data, message: e.target.value })}
        />
      </div>
    </div>
  );
}

// ── Config des en-têtes par type ──────────────────────────────────────────
const NODE_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  question: { emoji: '❓', label: 'Question',  color: '#1D4ED8', bg: '#EFF6FF' },
  solution: { emoji: '✅', label: 'Solution',  color: '#15803D', bg: '#F0FDF4' },
  ticket:   { emoji: '🎫', label: 'Ticket',    color: '#C2410C', bg: '#FFF7ED' },
  end:      { emoji: '🏁', label: 'Fin',       color: '#475569', bg: '#F8FAFC' },
};

// ── Panneau principal ─────────────────────────────────────────────────────
export default function NodeConfigPanel({ node, onChange, onDelete }: Props) {
  // Panneau vide si aucun nœud sélectionné
  if (!node) {
    return (
      <aside style={{
        width: '240px',
        minWidth: '240px',
        background: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
        color: '#CBD5E1',
        fontSize: '13px',
        textAlign: 'center',
        padding: '24px',
      }}>
        <span style={{ fontSize: '32px' }}>👈</span>
        <p style={{ margin: 0 }}>Clique sur un nœud pour modifier ses propriétés</p>
      </aside>
    );
  }

  const meta  = NODE_META[node.type ?? ''] ?? { emoji: '⬜', label: 'Nœud', color: '#475569', bg: '#F8FAFC' };
  const update = (newData: Record<string, unknown>) => onChange(node.id, newData);

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      background: '#FFFFFF',
      borderLeft: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
      overflowY: 'auto',
    }}>
      {/* En-tête du panneau */}
      <div style={{
        padding: '16px',
        background: meta.bg,
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '22px' }}>{meta.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: meta.color }}>
            {meta.label}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
            {node.id}
          </div>
        </div>
      </div>

      {/* Formulaire selon le type */}
      <div style={{ padding: '16px', flex: 1 }}>
        {node.type === 'question' && (
          <QuestionForm
            data={node.data as QuestionData}
            onChange={(d) => update(d as Record<string, unknown>)}
          />
        )}
        {node.type === 'solution' && (
          <SolutionForm
            data={node.data as SolutionData}
            onChange={(d) => update(d as Record<string, unknown>)}
          />
        )}
        {node.type === 'ticket' && (
          <TicketForm
            data={node.data as TicketData}
            onChange={(d) => update(d as Record<string, unknown>)}
          />
        )}
        {node.type === 'end' && (
          <EndForm
            data={node.data as EndData}
            onChange={(d) => update(d as Record<string, unknown>)}
          />
        )}
      </div>

      {/* Bouton supprimer — bien visible en bas du panneau */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #FEE2E2' }}>
        <button
          onClick={() => onDelete(node.id)}
          style={{
            width:        '100%',
            padding:      '9px 0',
            background:   '#FEF2F2',
            color:        '#DC2626',
            border:       '1px solid #FECACA',
            borderRadius: '8px',
            fontSize:     '13px',
            fontWeight:   700,
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            gap:          '6px',
          }}
        >
          🗑️ Supprimer ce nœud
        </button>
      </div>
    </aside>
  );
}
