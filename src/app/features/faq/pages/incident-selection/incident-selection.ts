import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StrapiService } from '../../services/strapi.service';
import { IncidentType } from '../../models/faq.models';

@Component({
  selector: 'app-incident-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-selection.html',
  styleUrl: './incident-selection.css',
})
export class IncidentSelectionComponent implements OnInit {
  private readonly strapi = inject(StrapiService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  incidents  = signal<IncidentType[]>([]);
  loading    = signal(true);
  error      = signal('');
  targetName = signal('');
  targetId   = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id   = params['targetId']   ?? '';
      const name = params['targetName'] ?? 'Équipement';
      this.targetId.set(id);
      this.targetName.set(name);

      if (!id) {
        this.router.navigate(['/targets']);
        return;
      }

      this.strapi.getIncidentTypes(id).subscribe({
        next:  (data) => { this.incidents.set(data); this.loading.set(false); },
        error: (err)  => { this.error.set(err.message); this.loading.set(false); },
      });
    });
  }

  selectIncident(incident: IncidentType): void {
    this.router.navigate(['/faq'], {
      queryParams: {
        incidentId:   incident.documentId,
        incidentName: incident.name,
        targetName:   this.targetName(),
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/targets']);
  }
}
