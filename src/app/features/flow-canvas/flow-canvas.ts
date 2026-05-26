import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Root } from 'react-dom/client';

@Component({
  selector: 'app-flow-canvas',
  standalone: true,
  templateUrl: './flow-canvas.html',
  styleUrl: './flow-canvas.css',
})
export class FlowCanvasComponent implements AfterViewInit, OnDestroy {
  // Référence vers le <div> du template HTML
  @ViewChild('flowContainer') containerRef!: ElementRef<HTMLDivElement>;

  private reactRoot!: Root;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit(): Promise<void> {
    // On vérifie qu'on est bien dans le navigateur (pas SSR)
    if (isPlatformBrowser(this.platformId)) {
      const { createRoot } = await import('react-dom/client');
      const React = await import('react');
      const { default: FlowCanvasReact } = await import('./flow-canvas.react');

      this.reactRoot = createRoot(this.containerRef.nativeElement);
      this.reactRoot.render(React.createElement(FlowCanvasReact));
    }
  }

  ngOnDestroy(): void {
    // On démonte React proprement quand Angular détruit le composant
    this.reactRoot?.unmount();
  }
}
