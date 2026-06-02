import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Le builder React Flow : rendu côté client uniquement
  // (React + @xyflow/react utilisent des APIs browser)
  {
    path: 'builder',
    renderMode: RenderMode.Client,
  },

  // Les pages FAQ : rendu côté serveur à la demande
  // (appels Strapi dynamiques, données variables)
  {
    path: 'targets',
    renderMode: RenderMode.Server,
  },
  {
    path: 'incidents',
    renderMode: RenderMode.Server,
  },
  {
    path: 'faq',
    renderMode: RenderMode.Server,
  },

  // Fallback
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
