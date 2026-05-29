import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StrapiService } from '../../services/strapi.service';
import {
  DecisionTree,
  DecisionNode,
  QuestionContent,
  SolutionContent,
  TicketContent,
  EndContent,
  FaqAnswer,
} from '../../models/faq.models';

@Component({
  selector: 'app-faq-journey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq-journey.html',
  styleUrl: './faq-journey.css',
})
export class FaqJourneyComponent implements OnInit {
  private readonly strapi = inject(StrapiService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  // ── État ────────────────────────────────────────────────────────────────
  tree          = signal<DecisionTree | null>(null);
  currentNodeId = signal('');
  history       = signal<string[]>([]);
  answers       = signal<FaqAnswer[]>([]);
  loading       = signal(true);
  error         = signal('');
  incidentName  = signal('');
  targetName    = signal('');

  // Ticket form
  ticketComment = signal('');
  ticketSent    = signal(false);

  // ── Computed : nœud courant ─────────────────────────────────────────────
  currentNode = computed<DecisionNode | null>(() => {
    const t = this.tree();
    const id = this.currentNodeId();
    if (!t || !id) return null;
    return t.decision_nodes.find((n) => n.nodeId === id) ?? null;
  });

  // Helpers de typage pour le template
  asQuestion = (c: unknown) => c as QuestionContent;
  asSolution = (c: unknown) => c as SolutionContent;
  asTicket   = (c: unknown) => c as TicketContent;
  asEnd      = (c: unknown) => c as EndContent;

  // ── Init ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const incidentId = params['incidentId'] ?? '';
      this.incidentName.set(params['incidentName'] ?? '');
      this.targetName.set(params['targetName'] ?? '');

      if (!incidentId) { this.router.navigate(['/targets']); return; }

      this.strapi.getPublishedTree(incidentId).subscribe({
        next: (tree) => {
          this.tree.set(tree);
          this.currentNodeId.set(this.findStartNode(tree));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Arbre introuvable');
          this.loading.set(false);
        },
      });
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  // Trouver le nœud de départ = celui qui n'est la cible d'aucune arête
  private findStartNode(tree: DecisionTree): string {
    const targets = new Set(tree.decision_edges.map((e) => e.target));
    const start   = tree.decision_nodes.find((n) => !targets.has(n.nodeId));
    return start?.nodeId ?? tree.decision_nodes[0]?.nodeId ?? '';
  }

  // Répondre à une question et avancer
  answer(choiceLabel: string): void {
    const tree = this.tree();
    const current = this.currentNodeId();
    if (!tree) return;

    // Chercher l'arête qui correspond au choix
    const edge = tree.decision_edges.find(
      (e) => e.source === current && e.label === choiceLabel,
    );

    // Si pas d'arête avec ce label, prendre la première arête sortante
    const nextEdge = edge ?? tree.decision_edges.find((e) => e.source === current);
    if (!nextEdge) return;

    // Enregistrer la réponse et avancer
    this.answers.update((prev) => [...prev, { nodeId: current, choice: choiceLabel }]);
    this.history.update((prev) => [...prev, current]);
    this.currentNodeId.set(nextEdge.target);
    this.ticketComment.set('');
    this.ticketSent.set(false);
  }

  // Avancer automatiquement (nœud solution → suivant)
  next(): void {
    const tree = this.tree();
    const current = this.currentNodeId();
    if (!tree) return;

    const edge = tree.decision_edges.find((e) => e.source === current);
    if (edge) {
      this.history.update((prev) => [...prev, current]);
      this.currentNodeId.set(edge.target);
    }
  }

  // Retour au nœud précédent
  goBack(): void {
    const hist = this.history();
    if (hist.length === 0) { this.router.navigate(['/incidents'], {
      queryParams: { targetName: this.targetName() }
    }); return; }

    const prev = hist[hist.length - 1];
    this.history.update((h) => h.slice(0, -1));
    this.answers.update((a) => a.slice(0, -1));
    this.currentNodeId.set(prev);
  }

  // Envoyer le ticket (simulation)
  submitTicket(): void {
    const node = this.currentNode();
    if (!node) return;
    const content = this.asTicket(node.content);
    console.log('🎫 Ticket créé :', {
      message:  content.message,
      priority: content.priority,
      category: content.category,
      comment:  this.ticketComment(),
      answers:  this.answers(),
    });
    this.ticketSent.set(true);
  }

  // Recommencer depuis le début
  restart(): void {
    const tree = this.tree();
    if (!tree) return;
    this.history.set([]);
    this.answers.set([]);
    this.currentNodeId.set(this.findStartNode(tree));
    this.ticketComment.set('');
    this.ticketSent.set(false);
  }

  goHome(): void {
    this.router.navigate(['/targets']);
  }
}
