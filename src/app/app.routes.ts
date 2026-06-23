import { Routes } from '@angular/router';
import { FlowCanvasComponent } from './features/flow-canvas/flow-canvas';

export const routes: Routes = [
  { path: '',        redirectTo: 'builder', pathMatch: 'full' },
  { path: 'builder', component: FlowCanvasComponent           },
  { path: '**',      redirectTo: 'builder'                    },
];
