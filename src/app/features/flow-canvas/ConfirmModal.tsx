import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

// ── Tokens ────────────────────────────────────────────────────────────────
const C = {
  surface:             '#ffffff',
  onSurface:           '#0b1c30',
  onSurfaceVariant:    '#434655',
  outline:             '#737686',
  outlineVariant:      '#c3c6d7',
  surfaceContainerLow: '#eff4ff',
  primary:             '#004ac6',
  error:               '#ba1a1a',
  errorContainerBg:    'rgba(186, 26, 26, 0.08)',
};

// ── Props ─────────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  open:          boolean;
  title:         string;
  message:       string;
  icon?:         string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:      'danger' | 'primary';
  onConfirm:     () => void;
  onCancel:      () => void;
}

// ── Composant ─────────────────────────────────────────────────────────────
export default function ConfirmModal({
  open,
  title,
  message,
  icon         = 'warning',
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  variant      = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {

  // Fermeture sur Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const accentColor = variant === 'danger' ? C.error : C.primary;
  const accentBg    = variant === 'danger' ? C.errorContainerBg : C.surfaceContainerLow;

  return ReactDOM.createPortal(
    <>
      {/* ── Keyframes ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes cmFadeIn  { from { opacity: 0; }                                       to { opacity: 1; } }
        @keyframes cmSlideUp { from { opacity: 0; transform: translateY(20px) scale(.97);} to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* ── Overlay ──────────────────────────────────────────────────── */}
      <div
        onClick={onCancel}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          background:     'rgba(11, 28, 48, 0.50)',
          backdropFilter: 'blur(6px)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '24px',
          animation:      'cmFadeIn 0.18s ease',
        }}
      >
        {/* ── Carte ────────────────────────────────────────────────── */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background:   C.surface,
            borderRadius: '28px',
            padding:      '36px 32px 32px',
            maxWidth:     '400px',
            width:        '100%',
            boxShadow:    '0 32px 80px rgba(11, 28, 48, 0.22)',
            animation:    'cmSlideUp 0.22s ease',
            fontFamily:   'Inter, system-ui, sans-serif',
          }}
        >
          {/* Icône centrale */}
          <div style={{
            width:          '72px',
            height:         '72px',
            background:     accentBg,
            borderRadius:   '24px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 24px',
          }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '36px', color: accentColor }}
            >{icon}</span>
          </div>

          {/* Titre */}
          <h2 style={{
            margin:        '0 0 10px',
            textAlign:     'center',
            fontSize:      '19px',
            fontWeight:    800,
            color:         C.onSurface,
            lineHeight:    1.3,
            letterSpacing: '-0.02em',
          }}>{title}</h2>

          {/* Message */}
          <p style={{
            margin:     '0 0 32px',
            textAlign:  'center',
            fontSize:   '14px',
            color:      C.outline,
            lineHeight: 1.65,
          }}>{message}</p>

          {/* Séparateur */}
          <div style={{ height: '1px', background: C.outlineVariant, marginBottom: '24px' }} />

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '10px' }}>

            {/* Annuler */}
            <button
              onClick={onCancel}
              style={{
                flex:        1,
                padding:     '13px',
                background:  'transparent',
                color:       C.onSurfaceVariant,
                border:      `1.5px solid ${C.outlineVariant}`,
                borderRadius: '14px',
                fontSize:    '14px',
                fontWeight:  600,
                cursor:      'pointer',
                fontFamily:  'inherit',
                transition:  'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.surfaceContainerLow;
                e.currentTarget.style.color = C.onSurface;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = C.onSurfaceVariant;
              }}
            >{cancelLabel}</button>

            {/* Confirmer */}
            <button
              onClick={onConfirm}
              style={{
                flex:           1,
                padding:        '13px',
                background:     accentColor,
                color:          '#ffffff',
                border:         'none',
                borderRadius:   '14px',
                fontSize:       '14px',
                fontWeight:     700,
                cursor:         'pointer',
                fontFamily:     'inherit',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '6px',
                transition:     'opacity 0.15s, box-shadow 0.15s',
                boxShadow:      variant === 'danger'
                  ? '0 4px 14px rgba(186, 26, 26, 0.30)'
                  : '0 4px 14px rgba(0, 74, 198, 0.30)',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
              {confirmLabel}
            </button>

          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
