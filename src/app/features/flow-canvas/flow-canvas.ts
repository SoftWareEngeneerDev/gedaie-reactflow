import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import FlowCanvasReact from './flow-canvas.react';

@Component({
  selector: 'app-flow-canvas',
  standalone: true,
  templateUrl: './flow-canvas.html',
  styleUrl: './flow-canvas.css',
})
export class FlowCanvasComponent implements AfterViewInit, OnDestroy {
  // Référence vers le <div> du template
  @ViewChild('flowContainer') containerRef!: ElementRef<HTMLDivElement>;

  private reactRoot?: Root;
  // L'app est rendue côté serveur (SSR) : React ne doit être monté que dans le navigateur
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    // On monte React dans le div Angular après que le DOM soit prêt
    this.reactRoot = createRoot(this.containerRef.nativeElement);
    this.reactRoot.render(React.createElement(FlowCanvasReact));
  }

  ngOnDestroy(): void {
    // On démonte React proprement quand Angular détruit le composant
    this.reactRoot?.unmount();
  }
}
