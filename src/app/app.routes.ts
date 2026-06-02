import { Routes } from '@angular/router';
import { FlowCanvasComponent }        from './features/flow-canvas/flow-canvas';
import { TargetSelectionComponent }   from './features/faq/pages/target-selection/target-selection';
import { IncidentSelectionComponent } from './features/faq/pages/incident-selection/incident-selection';
import { FaqJourneyComponent }        from './features/faq/pages/faq-journey/faq-journey';

export const routes: Routes = [
  // Redirection par défaut → sélection du target
  { path: '', redirectTo: 'targets', pathMatch: 'full' },

  // ── FAQ Client (parcours utilisateur) ──────────────────────────────────
  { path: 'targets',   component: TargetSelectionComponent  },
  { path: 'incidents', component: IncidentSelectionComponent },
  { path: 'faq',       component: FaqJourneyComponent        },

  // ── Builder React Flow (outil métier) ──────────────────────────────────
  { path: 'builder',   component: FlowCanvasComponent        },

  // Fallback
  { path: '**', redirectTo: 'targets' },
];
