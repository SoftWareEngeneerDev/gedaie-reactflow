import React, { useState } from 'react';
import { StrapiTarget, StrapiIncidentType } from './strapiService';

// ── Types ─────────────────────────────────────────────────────────────────
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'publishing' | 'published';

export interface TreeSummary {
  documentId: string;
  name:       string;
}

interface Props {
  // Arbre
  treeName:    string;
  documentId:  string;
  saveStatus:  SaveStatus;
  savedTrees:  TreeSummary[];
  // Contexte Target / Incident
  targets:                StrapiTarget[];
  selectedTargetId:       string;
  incidentTypes:          StrapiIncidentType[];
  selectedIncidentTypeId: string;
  // Handlers
  onNameChange:           (name: string) => void;
  onSave:                 () => void;
  onPublish:              () => void;
  onLoad:                 (documentId: string) => void;
  onClear:                () => void;
  onTargetChange:         (id: string) => void;
  onIncidentTypeChange:   (id: string) => void;
  onCreateTarget:         (name: string) => Promise<void>;
  onCreateIncidentType:   (name: string) => Promise<void>;
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

// ── Styles communs ────────────────────────────────────────────────────────
const selectStyle: React.CSSProperties = {
  padding:      '5px 8px',
  border:       '1px solid #E2E8F0',
  borderRadius: '7px',
  fontSize:     '12px',
  color:        '#1E293B',
  background:   '#FFFFFF',
  cursor:       'pointer',
  maxWidth:     '170px',
  outline:      'none',
};

const inlineInputStyle: React.CSSProperties = {
  padding:      '5px 8px',
  border:       '1px solid #3B82F6',
  borderRadius: '7px',
  fontSize:     '12px',
  color:        '#1E293B',
  background:   '#EFF6FF',
  outline:      'none',
  width:        '150px',
};

const miniBtn = (bg: string, color: string): React.CSSProperties => ({
  padding:      '4px 8px',
  background:   bg,
  color,
  border:       'none',
  borderRadius: '6px',
  fontSize:     '12px',
  fontWeight:   700,
  cursor:       'pointer',
});

const plusBtn: React.CSSProperties = {
  padding:      '4px 8px',
  background:   'transparent',
  color:        '#3B82F6',
  border:       '1px dashed #93C5FD',
  borderRadius: '6px',
  fontSize:     '12px',
  fontWeight:   700,
  cursor:       'pointer',
  whiteSpace:   'nowrap',
};

const labelStyle: React.CSSProperties = {
  fontSize:   '11px',
  fontWeight: 700,
  color:      '#64748B',
  whiteSpace: 'nowrap',
};

// ── Composant ─────────────────────────────────────────────────────────────
export default function TopBar({
  treeName, documentId, saveStatus, savedTrees,
  targets, selectedTargetId, incidentTypes, selectedIncidentTypeId,
  onNameChange, onSave, onPublish, onLoad, onClear,
  onTargetChange, onIncidentTypeChange, onCreateTarget, onCreateIncidentType,
}: Props) {
  const status = STATUS_CONFIG[saveStatus];
  const isBusy = saveStatus === 'saving' || saveStatus === 'publishing';

  // ── État local : formulaires inline de création ──────────────────────────
  const [creatingTarget,   setCreatingTarget]   = useState(false);
  const [newTargetName,    setNewTargetName]     = useState('');
  const [targetBusy,       setTargetBusy]       = useState(false);

  const [creatingIncident, setCreatingIncident] = useState(false);
  const [newIncidentName,  setNewIncidentName]  = useState('');
  const [incidentBusy,     setIncidentBusy]     = useState(false);

  // Confirmer la création d'un Target
  const confirmCreateTarget = async () => {
    if (!newTargetName.trim()) return;
    setTargetBusy(true);
    try {
      await onCreateTarget(newTargetName.trim());
      setNewTargetName('');
      setCreatingTarget(false);
    } finally {
      setTargetBusy(false);
    }
  };

  // Confirmer la création d'un Incident Type
  const confirmCreateIncident = async () => {
    if (!newIncidentName.trim()) return;
    setIncidentBusy(true);
    try {
      await onCreateIncidentType(newIncidentName.trim());
      setNewIncidentName('');
      setCreatingIncident(false);
    } finally {
      setIncidentBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 20 }}>

      {/* ── Barre de contexte (Cible + Incident) ────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '16px',
        padding:      '6px 20px',
        background:   '#F1F5F9',
        borderBottom: '1px solid #E2E8F0',
        flexWrap:     'wrap',
      }}>

        {/* Cible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={labelStyle}>🎯 Cible :</span>

          {!creatingTarget ? (
            <>
              <select
                style={selectStyle}
                value={selectedTargetId}
                onChange={(e) => onTargetChange(e.target.value)}
              >
                <option value="">— Choisir —</option>
                {targets.map((t) => (
                  <option key={t.documentId} value={t.documentId}>{t.name}</option>
                ))}
              </select>
              <button style={plusBtn} onClick={() => setCreatingTarget(true)}>
                + Nouveau
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                autoFocus
                style={inlineInputStyle}
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                placeholder="Nom de la cible..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter')  confirmCreateTarget();
                  if (e.key === 'Escape') { setCreatingTarget(false); setNewTargetName(''); }
                }}
                disabled={targetBusy}
              />
              <button
                style={miniBtn('#22C55E', '#FFFFFF')}
                onClick={confirmCreateTarget}
                disabled={targetBusy || !newTargetName.trim()}
                title="Confirmer (Entrée)"
              >
                {targetBusy ? '…' : '✓'}
              </button>
              <button
                style={miniBtn('#E2E8F0', '#64748B')}
                onClick={() => { setCreatingTarget(false); setNewTargetName(''); }}
                title="Annuler (Échap)"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />

        {/* Incident Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={labelStyle}>🔧 Incident :</span>

          {!creatingIncident ? (
            <>
              <select
                style={{
                  ...selectStyle,
                  opacity: selectedTargetId ? 1 : 0.5,
                  cursor:  selectedTargetId ? 'pointer' : 'not-allowed',
                }}
                value={selectedIncidentTypeId}
                onChange={(e) => onIncidentTypeChange(e.target.value)}
                disabled={!selectedTargetId}
              >
                <option value="">
                  {selectedTargetId ? '— Choisir —' : '← Choisir une cible d\'abord'}
                </option>
                {incidentTypes.map((i) => (
                  <option key={i.documentId} value={i.documentId}>{i.name}</option>
                ))}
              </select>
              <button
                style={{ ...plusBtn, opacity: selectedTargetId ? 1 : 0.4 }}
                onClick={() => selectedTargetId && setCreatingIncident(true)}
                disabled={!selectedTargetId}
                title={selectedTargetId ? 'Créer un nouveau type d\'incident' : 'Choisissez d\'abord une cible'}
              >
                + Nouveau
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                autoFocus
                style={inlineInputStyle}
                value={newIncidentName}
                onChange={(e) => setNewIncidentName(e.target.value)}
                placeholder="Type d'incident..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter')  confirmCreateIncident();
                  if (e.key === 'Escape') { setCreatingIncident(false); setNewIncidentName(''); }
                }}
                disabled={incidentBusy}
              />
              <button
                style={miniBtn('#22C55E', '#FFFFFF')}
                onClick={confirmCreateIncident}
                disabled={incidentBusy || !newIncidentName.trim()}
                title="Confirmer (Entrée)"
              >
                {incidentBusy ? '…' : '✓'}
              </button>
              <button
                style={miniBtn('#E2E8F0', '#64748B')}
                onClick={() => { setCreatingIncident(false); setNewIncidentName(''); }}
                title="Annuler (Échap)"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Indicateur de liaison */}
        {selectedIncidentTypeId && (
          <span style={{
            fontSize:     '11px',
            color:        '#15803D',
            background:   '#DCFCE7',
            padding:      '3px 8px',
            borderRadius: '20px',
            fontWeight:   600,
            whiteSpace:   'nowrap',
          }}>
            🔗 Lié
          </span>
        )}
      </div>

      {/* ── Barre principale ─────────────────────────────────────────────── */}
      <header style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        padding:      '10px 20px',
        background:   '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow:    '0 1px 4px rgba(0,0,0,0.06)',
      }}>

        {/* Logo */}
        <span style={{ fontSize: '20px', marginRight: '2px' }}>🌳</span>
        <span style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B', whiteSpace: 'nowrap' }}>
          FAQ Builder
        </span>

        <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 4px' }} />

        {/* Nom de l'arbre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
          <label style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap', fontWeight: 600 }}>
            Nom :
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

        {/* Document ID */}
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

        {/* Charger un arbre */}
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
              <option key={t.documentId} value={t.documentId}>{t.name}</option>
            ))}
          </select>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Vider */}
        <button
          onClick={() => { if (window.confirm('Vider tout le canvas ? Cette action est irréversible.')) onClear(); }}
          disabled={isBusy}
          style={{
            padding:      '8px 14px',
            background:   isBusy ? '#E2E8F0' : '#FEF2F2',
            color:        isBusy ? '#94A3B8' : '#DC2626',
            border:       `1px solid ${isBusy ? '#E2E8F0' : '#FECACA'}`,
            borderRadius: '8px',
            fontSize:     '13px',
            fontWeight:   700,
            cursor:       isBusy ? 'not-allowed' : 'pointer',
            whiteSpace:   'nowrap',
          }}
        >
          🗑️ Vider
        </button>

        {/* Sauvegarder */}
        <button
          onClick={onSave}
          disabled={isBusy || !treeName.trim()}
          style={{
            padding:      '8px 16px',
            background:   isBusy || !treeName.trim() ? '#E2E8F0' : '#3B82F6',
            color:        isBusy || !treeName.trim() ? '#94A3B8' : '#FFFFFF',
            border:       'none',
            borderRadius: '8px',
            fontSize:     '13px',
            fontWeight:   700,
            cursor:       isBusy || !treeName.trim() ? 'not-allowed' : 'pointer',
            whiteSpace:   'nowrap',
          }}
        >
          💾 Sauvegarder
        </button>

        {/* Publier */}
        <button
          onClick={onPublish}
          disabled={isBusy || !documentId}
          style={{
            padding:      '8px 16px',
            background:   isBusy || !documentId ? '#E2E8F0' : '#8B5CF6',
            color:        isBusy || !documentId ? '#94A3B8' : '#FFFFFF',
            border:       'none',
            borderRadius: '8px',
            fontSize:     '13px',
            fontWeight:   700,
            cursor:       isBusy || !documentId ? 'not-allowed' : 'pointer',
            whiteSpace:   'nowrap',
          }}
        >
          🚀 Publier
        </button>

      </header>
    </div>
  );
}
