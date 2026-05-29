// ── Target — Équipement / Produit ─────────────────────────────────────────
export interface Target {
  id:           number;
  documentId:   string;
  name:         string;
  slug:         string;
  description?: string;
}

// ── IncidentType — Type de problème ──────────────────────────────────────
export interface IncidentType {
  id:           number;
  documentId:   string;
  name:         string;
  slug:         string;
  description?: string;
  target?:      Target;
}

// ── DecisionNode — Nœud de l'arbre ───────────────────────────────────────
export type NodeType = 'question' | 'solution' | 'ticket' | 'end';

export interface QuestionContent {
  question: string;
  options:  { label: string; nextNodeId?: string }[];
}
export interface SolutionContent {
  title:    string;
  message:  string;
  steps?:   string[];
}
export interface TicketContent {
  message:   string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}
export interface EndContent {
  message: string;
}

export type NodeContent = QuestionContent | SolutionContent | TicketContent | EndContent;

export interface DecisionNode {
  id:         number;
  documentId: string;
  nodeId:     string;
  type:       NodeType;
  label:      string;
  content:    NodeContent;
  positionX:  number;
  positionY:  number;
}

// ── DecisionEdge — Lien entre nœuds ──────────────────────────────────────
export interface DecisionEdge {
  id:         number;
  documentId: string;
  edgeId:     string;
  source:     string;  // nodeId source
  target:     string;  // nodeId cible
  label:      string;  // texte du choix (Oui / Non / ...)
}

// ── DecisionTree — Arbre complet ──────────────────────────────────────────
export interface DecisionTree {
  id:              number;
  documentId:      string;
  name:            string;
  slug:            string;
  version:         number;
  publishedAt?:    string;
  decision_nodes:  DecisionNode[];
  decision_edges:  DecisionEdge[];
}

// ── Réponse Strapi (format liste) ─────────────────────────────────────────
export interface StrapiList<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

// ── Réponse Strapi (format unique) ────────────────────────────────────────
export interface StrapiSingle<T> {
  data: T;
}

// ── État du parcours FAQ ──────────────────────────────────────────────────
export interface FaqAnswer {
  nodeId: string;
  choice: string;
}

export interface FaqJourneyState {
  tree:          DecisionTree;
  currentNodeId: string;
  history:       string[];   // pile des nodeId visités (pour le bouton Retour)
  answers:       FaqAnswer[];
}
