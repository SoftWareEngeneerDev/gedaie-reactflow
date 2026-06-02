import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-flow-canvas',
  standalone: true,
  templateUrl: './flow-canvas.html',
  styleUrl: './flow-canvas.css',
})
export class FlowCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('flowContainer') containerRef!: ElementRef<HTMLDivElement>;

  private reactRoot?: { unmount: () => void };

  async ngAfterViewInit(): Promise<void> {
    const { mountFlowCanvas } = await import('./flow-canvas.react');
    this.reactRoot = mountFlowCanvas(this.containerRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.reactRoot?.unmount();
  }
}
