import React, { useState } from 'react';
import { StrapiTarget, StrapiIncidentType, Device, Product, TargetPayload } from './strapiService';
import ConfirmModal from './ConfirmModal';

// ── Types ─────────────────────────────────────────────────────────────────
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'publishing' | 'published';

export interface TreeSummary {
  documentId: string;
  name:       string;
}

interface Props {
  treeName:               string;
  documentId:             string;
  saveStatus:             SaveStatus;
  savedTrees:             TreeSummary[];
  targets:                StrapiTarget[];
  selectedTargetId:       string;
  incidentTypes:          StrapiIncidentType[];
  selectedIncidentTypeId: string;
  devices:                Device[];
  products:               Product[];
  onNameChange:           (name: string) => void;
  onSave:                 () => void;
  onPublish:              () => void;
  onLoad:                 (documentId: string) => void;
  onClear:                () => void;
  onTargetChange:         (id: string) => void;
  onIncidentTypeChange:   (id: string) => void;
  onCreateTarget:         (payload: TargetPayload) => Promise<void>;
  onCreateIncidentType:   (name: string) => Promise<void>;
}

// ── Tokens ────────────────────────────────────────────────────────────────
const C = {
  primary:             '#004ac6',
  primaryContainer:    '#2563eb',
  surface:             '#ffffff',
  surfaceContainer:    '#e5eeff',
  surfaceContainerLow: '#eff4ff',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#434655',
  outlineVariant:      '#c3c6d7',
  outline:             '#737686',
  secondary:           '#006c49',
};

const STATUS_CONFIG: Record<SaveStatus, { label: string; color: string; bg: string }> = {
  idle:       { label: '',                    color: 'transparent', bg: 'transparent' },
  saving:     { label: '⏳ Sauvegarde...',    color: '#92400E',     bg: '#FEF3C7'     },
  saved:      { label: '✅ Sauvegardé',       color: '#166534',     bg: '#DCFCE7'     },
  error:      { label: '❌ Erreur',           color: '#991B1B',     bg: '#FEE2E2'     },
  publishing: { label: '⏳ Publication...',   color: C.primary,     bg: C.surfaceContainerLow },
  published:  { label: '🚀 Publié',           color: C.primary,     bg: C.surfaceContainerLow },
};

// ── Composant ─────────────────────────────────────────────────────────────
export default function TopBar({
  treeName, documentId, saveStatus, savedTrees,
  targets, selectedTargetId, incidentTypes, selectedIncidentTypeId, devices, products,
  onNameChange, onSave, onPublish, onLoad, onClear,
  onTargetChange, onIncidentTypeChange, onCreateTarget, onCreateIncidentType,
}: Props) {
  const status = STATUS_CONFIG[saveStatus];
  const isBusy = saveStatus === 'saving' || saveStatus === 'publishing';

  const [clearModalOpen,   setClearModalOpen]   = useState(false);
  const [creatingTarget,   setCreatingTarget]   = useState(false);
  const [targetSearch,     setTargetSearch]     = useState('');
  const [targetBusy,       setTargetBusy]       = useState(false);
  const [targetTab,        setTargetTab]        = useState<'device' | 'product'>('device');
  const [hoveredItemId,    setHoveredItemId]    = useState<string | null>(null);
  const [creatingIncident, setCreatingIncident] = useState(false);
  const [newIncidentName,  setNewIncidentName]  = useState('');
  const [incidentBusy,     setIncidentBusy]     = useState(false);

  const filteredDevices  = devices.filter(d =>
    d.name.toLowerCase().includes(targetSearch.toLowerCase())
  );
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(targetSearch.toLowerCase())
  );

  const closeCombobox = () => { setCreatingTarget(false); setTargetSearch(''); setTargetTab('device'); };

  const handleSelectItem = async (name: string, externalRef: string, targetType: 'device' | 'product') => {
    const existing = targets.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      onTargetChange(existing.documentId);
      closeCombobox();
      return;
    }
    setTargetBusy(true);
    try { await onCreateTarget({ name, externalRef, targetType }); closeCombobox(); }
    finally { setTargetBusy(false); }
  };

  const confirmIncident = async () => {
    if (!newIncidentName.trim()) return;
    setIncidentBusy(true);
    try { await onCreateIncidentType(newIncidentName.trim()); setNewIncidentName(''); setCreatingIncident(false); }
    finally { setIncidentBusy(false); }
  };

  return (
    <>
    <header style={{
      height:       '64px',
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      padding:      '0 40px',
      background:   C.surface,
      borderBottom: `1px solid ${C.outlineVariant}`,
      flexShrink:   0,
      zIndex:       50,
      fontFamily:   'Inter, system-ui, sans-serif',
      gap:          '24px',
    }}>

      {/* ── Gauche : Logo + Pill ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ color: C.primary, fontSize: '28px' }}>account_tree</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: C.onSurface, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            FAQ Builder
          </span>
        </div>

        {/* Pill contextuel */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '16px',
          background:   C.surfaceContainer,
          border:       `1px solid ${C.outlineVariant}`,
          borderRadius: '9999px',
          padding:      '4px 16px',
          flexShrink:   0,
        }}>

          {/* Cible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>Cible :</span>
            {!creatingTarget ? (
              <>
                <select
                  value={selectedTargetId}
                  onChange={e => onTargetChange(e.target.value)}
                  style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: 600, color: C.onSurface, cursor: 'pointer', outline: 'none', padding: '0 4px', maxWidth: '140px' }}
                >
                  <option value="">— Choisir —</option>
                  {targets.map(t => <option key={t.documentId} value={t.documentId}>{t.name}</option>)}
                </select>
                <button
                  style={{ background: 'none', border: 'none', color: C.primary, fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
                  onClick={() => setCreatingTarget(true)}
                >+ Nouveau</button>
              </>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Ligne : onglets + recherche + fermer */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {/* Onglet Équipement */}
                  <button
                    onClick={() => { setTargetTab('device'); setTargetSearch(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', fontSize: '11px', fontWeight: 600, border: `1px solid ${targetTab === 'device' ? C.primary : C.outlineVariant}`, borderRadius: '4px', background: targetTab === 'device' ? C.primary : 'transparent', color: targetTab === 'device' ? '#fff' : C.onSurfaceVariant, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>computer</span>
                    Équipement
                  </button>
                  {/* Onglet Produit */}
                  <button
                    onClick={() => { setTargetTab('product'); setTargetSearch(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 7px', fontSize: '11px', fontWeight: 600, border: `1px solid ${targetTab === 'product' ? C.primary : C.outlineVariant}`, borderRadius: '4px', background: targetTab === 'product' ? C.primary : 'transparent', color: targetTab === 'product' ? '#fff' : C.onSurfaceVariant, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>inventory_2</span>
                    Produit
                  </button>
                  <button onClick={closeCombobox} style={{ background: C.outlineVariant, color: C.onSurfaceVariant, border: 'none', borderRadius: '4px', padding: '3px 7px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                </div>

                {/* Champ de recherche */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: C.onSurfaceVariant }}>search</span>
                  <input
                    autoFocus
                    value={targetSearch}
                    placeholder={targetTab === 'device' ? 'Rechercher un équipement…' : 'Rechercher un produit…'}
                    disabled={targetBusy}
                    onChange={e => setTargetSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') closeCombobox(); }}
                    style={{ width: '170px', padding: '3px 8px', border: `1px solid ${C.primary}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: C.surface, color: C.onSurface, fontFamily: 'inherit' }}
                  />
                </div>

                {/* Liste déroulante */}
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '8px', maxHeight: '220px', overflowY: 'auto', width: '230px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                  {targetBusy ? (
                    <div style={{ padding: '10px 12px', fontSize: '12px', color: C.onSurfaceVariant, textAlign: 'center' }}>Création en cours…</div>
                  ) : targetTab === 'device' ? (
                    filteredDevices.length === 0
                      ? <div style={{ padding: '10px 12px', fontSize: '12px', color: C.onSurfaceVariant, fontStyle: 'italic' }}>Aucun équipement trouvé</div>
                      : filteredDevices.map(d => (
                          <div
                            key={d.id}
                            onClick={() => handleSelectItem(d.name, String(d.id), 'device')}
                            onMouseEnter={() => setHoveredItemId(String(d.id))}
                            onMouseLeave={() => setHoveredItemId(null)}
                            style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: C.onSurface, background: hoveredItemId === String(d.id) ? C.surfaceContainerLow : 'transparent', transition: 'background 0.1s' }}
                          >
                            {d.name}
                          </div>
                        ))
                  ) : (
                    filteredProducts.length === 0
                      ? <div style={{ padding: '10px 12px', fontSize: '12px', color: C.onSurfaceVariant, fontStyle: 'italic' }}>Aucun produit trouvé</div>
                      : filteredProducts.map(p => (
                          <div
                            key={p.value}
                            onClick={() => handleSelectItem(p.name, p.value, 'product')}
                            onMouseEnter={() => setHoveredItemId(p.value)}
                            onMouseLeave={() => setHoveredItemId(null)}
                            style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: C.onSurface, background: hoveredItemId === p.value ? C.surfaceContainerLow : 'transparent', transition: 'background 0.1s' }}
                          >
                            {p.name}
                          </div>
                        ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '16px', background: C.outlineVariant }} />

          {/* Incident */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>Incident :</span>
            {!creatingIncident ? (
              <>
                <select
                  value={selectedIncidentTypeId}
                  disabled={!selectedTargetId}
                  onChange={e => onIncidentTypeChange(e.target.value)}
                  style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: 600, color: C.onSurface, cursor: selectedTargetId ? 'pointer' : 'not-allowed', outline: 'none', padding: '0 4px', maxWidth: '140px', opacity: selectedTargetId ? 1 : 0.5 }}
                >
                  <option value="">{selectedTargetId ? '— Choisir —' : "← Cible d'abord"}</option>
                  {incidentTypes.map(i => <option key={i.documentId} value={i.documentId}>{i.name}</option>)}
                </select>
                <button
                  disabled={!selectedTargetId}
                  onClick={() => selectedTargetId && setCreatingIncident(true)}
                  style={{ background: 'none', border: 'none', color: selectedTargetId ? C.primary : C.outline, fontSize: '12px', fontWeight: 700, cursor: selectedTargetId ? 'pointer' : 'not-allowed', padding: 0, whiteSpace: 'nowrap' }}
                >+ Nouveau</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  autoFocus
                  value={newIncidentName}
                  placeholder="Type d'incident…"
                  disabled={incidentBusy}
                  onChange={e => setNewIncidentName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmIncident(); if (e.key === 'Escape') { setCreatingIncident(false); setNewIncidentName(''); } }}
                  style={{ width: '140px', padding: '3px 8px', border: `1px solid ${C.primary}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: C.surface, color: C.onSurface, fontFamily: 'inherit' }}
                />
                <button onClick={confirmIncident} disabled={incidentBusy || !newIncidentName.trim()} style={{ background: C.secondary, color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>{incidentBusy ? '…' : '✓'}</button>
                <button onClick={() => { setCreatingIncident(false); setNewIncidentName(''); }} style={{ background: C.outlineVariant, color: C.onSurfaceVariant, border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>

          {/* Badge Lié */}
          {selectedIncidentTypeId && (
            <>
              <div style={{ width: '1px', height: '16px', background: C.outlineVariant }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 10px', background: 'rgba(0,108,73,0.1)', border: '1px solid rgba(0,108,73,0.2)', borderRadius: '9999px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: C.secondary }}>link</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lié</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Droite : actions ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

        {/* ID pill */}
        {documentId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}`, borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: C.onSurfaceVariant }}>ID: {documentId.slice(0, 8)}…</span>
            <span className="material-symbols-outlined" title="Copier l'ID" style={{ fontSize: '14px', color: C.onSurfaceVariant, cursor: 'pointer' }}
              onClick={() => navigator.clipboard?.writeText(documentId)}>content_copy</span>
          </div>
        )}

        {/* Statut */}
        {saveStatus !== 'idle' && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: status.color, background: status.bg, padding: '4px 12px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
            {status.label}
          </span>
        )}

        {/* Vider */}
        <button
          onClick={() => setClearModalOpen(true)}
          disabled={isBusy}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'transparent', color: isBusy ? C.outline : C.onSurfaceVariant, border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: isBusy ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'background 0.15s' }}
          onMouseEnter={e => { if (!isBusy) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete_sweep</span>
          Vider
        </button>

        {/* Sauvegarder */}
        <button
          onClick={onSave}
          disabled={isBusy || !treeName.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: C.surface, color: isBusy || !treeName.trim() ? C.outline : C.onSurface, border: `1px solid ${C.outlineVariant}`, borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: isBusy || !treeName.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'background 0.15s' }}
          onMouseEnter={e => { if (!isBusy && treeName.trim()) (e.currentTarget as HTMLButtonElement).style.background = C.surfaceContainerLow; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.surface; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
          Sauvegarder
        </button>

        {/* Publier */}
        <button
          onClick={onPublish}
          disabled={isBusy || !documentId}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: isBusy || !documentId ? C.outlineVariant : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: isBusy || !documentId ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', boxShadow: documentId ? '0 4px 12px rgba(37,99,235,0.25)' : 'none', transition: 'background 0.15s' }}
          onMouseEnter={e => { if (!isBusy && documentId) (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
          onMouseLeave={e => { if (!isBusy && documentId) (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>publish</span>
          Publier
        </button>
      </div>
    </header>

    {/* ── Modal de confirmation : Vider le canvas ────────────────────────── */}
    <ConfirmModal
      open={clearModalOpen}
      icon="delete_sweep"
      variant="danger"
      title="Vider le canvas ?"
      message="Tous les nœuds et connexions seront supprimés. Cette action est irréversible."
      confirmLabel="Tout supprimer"
      cancelLabel="Annuler"
      onConfirm={() => { setClearModalOpen(false); onClear(); }}
      onCancel={() => setClearModalOpen(false)}
    />
    </>
  );
}
