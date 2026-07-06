import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowCanvasComponent } from './flow-canvas';

describe('FlowCanvasComponent', () => {
  let component: FlowCanvasComponent;
  let fixture: ComponentFixture<FlowCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowCanvasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlowCanvasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
