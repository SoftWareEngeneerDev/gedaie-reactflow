import { Node, Edge } from '@xyflow/react';

// ── Configuration ─────────────────────────────────────────────────────────
const STRAPI_URL = 'http://localhost:1337';

// ── Types ─────────────────────────────────────────────────────────────────
export interface StrapiTree {
  documentId: string;
  name:       string;
  slug:       string;
  version:    number;
}

export interface SaveTreePayload {
  nodes: Node[];
  edges: Edge[];
}

// ── Helpers ───────────────────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.text();
    const msg = `Strapi ${res.status} ${res.url}: ${err}`;
    console.error('[strapiService]', msg);
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── API : lister tous les arbres sauvegardés ─────────────────────────────
export async function listTrees(): Promise<StrapiTree[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/decision-trees?sort=updatedAt:desc&pagination[pageSize]=50`,
  );
  const json = await handleResponse<{ data: StrapiTree[] }>(res);
  return json.data;
}

// ── API : créer un nouvel arbre ───────────────────────────────────────────
export async function createTree(name: string): Promise<StrapiTree> {
  const res = await fetch(`${STRAPI_URL}/api/decision-trees`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { name, version: 1 } }),
  });
  const json = await handleResponse<{ data: StrapiTree }>(res);
  return json.data;
}

// ── API : sauvegarder les nœuds et liens d'un arbre ──────────────────────
export async function saveTree(
  documentId: string,
  payload: SaveTreePayload,
): Promise<StrapiTree> {
  const res = await fetch(
    `${STRAPI_URL}/api/decision-trees/${documentId}/save-tree`,
    {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodes: payload.nodes,
        edges: payload.edges,
      }),
    },
  );
  const json = await handleResponse<{ data: StrapiTree }>(res);
  return json.data;
}

// ── API : publier un arbre ────────────────────────────────────────────────
export async function publishTree(documentId: string): Promise<StrapiTree> {
  const res = await fetch(
    `${STRAPI_URL}/api/decision-trees/${documentId}`,
    {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { publishedAt: new Date().toISOString() } }),
    },
  );
  const json = await handleResponse<{ data: StrapiTree }>(res);
  return json.data;
}

// ── API : charger un arbre existant ──────────────────────────────────────
export async function loadTree(documentId: string): Promise<{
  tree:  StrapiTree;
  nodes: Node[];
  edges: Edge[];
}> {
  // Strapi v5 : utiliser populate=* (la syntaxe "field1,field2" n'est pas supportée)
  const res = await fetch(
    `${STRAPI_URL}/api/decision-trees/${documentId}?populate=*`,
  );
  const json = await handleResponse<{ data: Record<string, unknown> }>(res);
  const raw = json.data;

  console.log('[loadTree] raw response:', raw);

  // ── Cas 1 : nodes/edges stockés comme champs JSON directement sur l'arbre
  //    (si le custom endpoint save-tree met à jour des champs JSON de l'arbre)
  if (Array.isArray(raw['nodes']) && (raw['nodes'] as unknown[]).length > 0) {
    return {
      tree:  raw as unknown as StrapiTree,
      nodes: raw['nodes'] as Node[],
      edges: (raw['edges'] as Edge[] | undefined) ?? [],
    };
  }

  // ── Cas 2 : nodes/edges stockés en relations (DecisionNode / DecisionEdge)
  //    Strapi v5 peut renvoyer les noms en snake_case OU camelCase
  type RawNode = {
    nodeId: string; type: string; label?: string;
    content?: Record<string, unknown>;
    positionX?: number; positionY?: number;
  };
  type RawEdge = {
    edgeId: string; source: string; target: string; label?: string;
  };

  const rawNodes = (
    (raw['decision_nodes'] ?? raw['decisionNodes'] ?? []) as RawNode[]
  );
  const rawEdges = (
    (raw['decision_edges'] ?? raw['decisionEdges'] ?? []) as RawEdge[]
  );

  const nodes: Node[] = rawNodes.map((n) => ({
    id:       n.nodeId,
    type:     n.type,
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data:     n.content ?? { label: n.label ?? '' },
  }));

  const edges: Edge[] = rawEdges.map((e) => ({
    id:       e.edgeId,
    source:   e.source,
    target:   e.target,
    label:    e.label ?? '',
    animated: true,
  }));

  return { tree: raw as unknown as StrapiTree, nodes, edges };
}
