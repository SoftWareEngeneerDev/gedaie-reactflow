import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StrapiService } from '../../services/strapi.service';
import { Target } from '../../models/faq.models';

@Component({
  selector: 'app-target-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target-selection.html',
  styleUrl: './target-selection.css',
})
export class TargetSelectionComponent implements OnInit {
  private readonly strapi = inject(StrapiService);
  private readonly router = inject(Router);

  targets  = signal<Target[]>([]);
  loading  = signal(true);
  error    = signal('');
  search   = signal('');

  filteredTargets = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.targets();
    return this.targets().filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
    );
  });

  // Emojis par défaut selon le nom du target (fallback si pas d'icône Strapi)
  private readonly ICONS: Record<string, string> = {
    imprimante: '🖨️', ordinateur: '💻', réseau: '📶',
    logiciel: '💿', téléphone: '📱', serveur: '🖥️',
  };

  getIcon(name: string): string {
    const key = Object.keys(this.ICONS).find((k) =>
      name.toLowerCase().includes(k)
    );
    return key ? this.ICONS[key] : '⚙️';
  }

  ngOnInit(): void {
    this.strapi.getTargets().subscribe({
      next:  (data) => { this.targets.set(data); this.loading.set(false); },
      error: (err)  => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  selectTarget(target: Target): void {
    this.router.navigate(['/incidents'], {
      queryParams: { targetId: target.documentId, targetName: target.name },
    });
  }
}
