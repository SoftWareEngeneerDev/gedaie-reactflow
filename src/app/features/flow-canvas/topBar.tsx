import React from 'react';

// ── Types ─────────────────────────────────────────────────────────────────
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'publishing' | 'published';

export interface TreeSummary {
  documentId: string;
  name:       string;
}

interface Props {
  treeName:    string;
  documentId:  string;
  saveStatus:  SaveStatus;
  savedTrees:  TreeSummary[];
  onNameChange: (name: string) => void;
  onSave:       () => void;
  onPublish:    () => void;
  onLoad:       (documentId: string) => void;
  onClear:      () => void;
}

// ── Config des statuts ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SaveStatus, { label: string; color: string; bg: string }> = {
  idle:       { label: '',                    color: 'transparent', bg: 'transparent' },
  saving:     { label: '⏳ Sauvegarde...',    color: '#92400E',     bg: '#FEF3C7' },
  saved:      { label: '✅ Sauvegardé !',     color: '#15803D',     bg: '#DCFCE7' },
  error:      { label: '❌ Erreur Strapi',    color: '#991B1B',     bg: '#FEE2E2' },
  publishing: { label: '⏳ Publication...',   color: '#1E40AF',     bg: '#DBEAFE' },
  published:  { label: '🚀 Publié !',         color: '#1E40AF',     bg: '#DBEAFE' },
};

export default function TopBar({
  treeName,
  documentId,
  saveStatus,
  savedTrees,
  onNameChange,
  onSave,
  onPublish,
  onLoad,
  onClear,
}: Props) {
  const status  = STATUS_CONFIG[saveStatus];
  const isBusy  = saveStatus === 'saving' || saveStatus === 'publishing';

  return (
    <header style={{
      display:        'flex',
      alignItems:     'center',
      gap:            '12px',
      padding:        '10px 20px',
      background:     '#FFFFFF',
      borderBottom:   '1px solid #E2E8F0',
      boxShadow:      '0 1px 4px rgba(0,0,0,0.06)',
      zIndex:         20,
      flexShrink:     0,
    }}>
      {/* Logo / Titre */}
      <span style={{ fontSize: '20px', marginRight: '4px' }}>🌳</span>
      <span style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B', whiteSpace: 'nowrap' }}>
        FAQ Builder
      </span>

      {/* Séparateur */}
      <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 4px' }} />

      {/* Nom de l'arbre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '380px' }}>
        <label style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap', fontWeight: 600 }}>
          Nom de l'arbre :
        </label>
        <input
          value={treeName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex : Résolution imprimante v1"
          style={{
            flex:         1,
            padding:      '6px 10px',
            border:       '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize:     '13px',
            color:        '#1E293B',
            background:   '#F8FAFC',
            outline:      'none',
          }}
        />
      </div>

      {/* Document ID (lecture seule si déjà sauvegardé) */}
      {documentId && (
        <span style={{
          fontSize:     '11px',
          color:        '#94A3B8',
          background:   '#F1F5F9',
          padding:      '3px 8px',
          borderRadius: '6px',
          fontFamily:   'monospace',
          whiteSpace:   'nowrap',
        }}>
          id: {documentId.slice(0, 8)}…
        </span>
      )}

      {/* Statut */}
      {saveStatus !== 'idle' && (
        <span style={{
          fontSize:     '12px',
          fontWeight:   600,
          color:        status.color,
          background:   status.bg,
          padding:      '4px 10px',
          borderRadius: '20px',
          whiteSpace:   'nowrap',
        }}>
          {status.label}
        </span>
      )}

      {/* Sélecteur de chargement */}
      {savedTrees.length > 0 && (
        <select
          style={{
            padding:      '7px 10px',
            border:       '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize:     '13px',
            color:        '#1E293B',
            background:   '#F8FAFC',
            cursor:       'pointer',
            maxWidth:     '200px',
          }}
          value=""
          onChange={(e) => { if (e.target.value) onLoad(e.target.value); }}
        >
          <option value="">📂 Charger un arbre...</option>
          {savedTrees.map((t) => (
            <option key={t.documentId} value={t.documentId}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bouton Vider le canvas */}
      <button
        onClick={() => { if (window.confirm('Vider tout le canvas ? Cette action est irréversible.')) onClear(); }}
        disabled={isBusy}
        title="Supprimer tous les nœuds et connexions"
        style={{
          padding:        '8px 14px',
          background:     isBusy ? '#E2E8F0' : '#FEF2F2',
          color:          isBusy ? '#94A3B8' : '#DC2626',
          border:         `1px solid ${isBusy ? '#E2E8F0' : '#FECACA'}`,
          borderRadius:   '8px',
          fontSize:       '13px',
          fontWeight:     700,
          cursor:         isBusy ? 'not-allowed' : 'pointer',
          transition:     'background 0.2s',
          whiteSpace:     'nowrap',
        }}
      >
        🗑️ Vider
      </button>

      {/* Bouton Sauvegarder */}
      <button
        onClick={onSave}
        disabled={isBusy || !treeName.trim()}
        style={{
          padding:        '8px 16px',
          background:     isBusy || !treeName.trim() ? '#E2E8F0' : '#3B82F6',
          color:          isBusy || !treeName.trim() ? '#94A3B8' : '#FFFFFF',
          border:         'none',
          borderRadius:   '8px',
          fontSize:       '13px',
          fontWeight:     700,
          cursor:         isBusy || !treeName.trim() ? 'not-allowed' : 'pointer',
          transition:     'background 0.2s',
          whiteSpace:     'nowrap',
        }}
      >
        💾 Sauvegarder
      </button>

      {/* Bouton Publier */}
      <button
        onClick={onPublish}
        disabled={isBusy || !documentId}
        style={{
          padding:        '8px 16px',
          background:     isBusy || !documentId ? '#E2E8F0' : '#8B5CF6',
          color:          isBusy || !documentId ? '#94A3B8' : '#FFFFFF',
          border:         'none',
          borderRadius:   '8px',
          fontSize:       '13px',
          fontWeight:     700,
          cursor:         isBusy || !documentId ? 'not-allowed' : 'pointer',
          transition:     'background 0.2s',
          whiteSpace:     'nowrap',
        }}
      >
        🚀 Publier
      </button>
    </header>
  );
}
