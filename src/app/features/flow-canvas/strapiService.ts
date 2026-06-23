import { Node, Edge } from '@xyflow/react';

// ── Configuration ─────────────────────────────────────────────────────────
const STRAPI_URL = '';

// ── Types ─────────────────────────────────────────────────────────────────
export interface StrapiTarget {
  documentId:   string;
  name:         string;
  externalRef?: string;
  targetType?:  'device' | 'product';
}

export interface TargetPayload {
  name:        string;
  externalRef: string;
  targetType:  'device' | 'product';
}

export interface StrapiIncidentType {
  documentId: string;
  name:       string;
  target?:    StrapiTarget;
}

export interface StrapiTree {
  documentId:    string;
  name:          string;
  slug:          string;
  version:       number;
  incident_type?: StrapiIncidentType;
}

export interface SaveTreePayload {
  nodes:           Node[];
  edges:           Edge[];
  incidentTypeId?: string;   // lie l'arbre à un type d'incident au moment du save
}

export interface Device {
  id:   number;
  name: string;
}

export interface Product {
  value: string;
  name:  string;
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

// ── API : Équipements externes (Larco) ────────────────────────────────────

export async function getDevicesAndProducts(): Promise<{ devices: Device[]; products: Product[] }> {
  const res = await fetch('/larco-api/larco-geadaie/api/v1/devices-products-lite');
  if (!res.ok) throw new Error(`Erreur chargement équipements: ${res.status}`);
  const json = await res.json() as {
    returnStatus: string;
    data: { devices: Device[]; products: Product[] };
  };
  return { devices: json.data.devices, products: json.data.products };
}

// ── API : Targets ─────────────────────────────────────────────────────────

export async function listTargets(): Promise<StrapiTarget[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/targets?sort=name:asc&pagination[pageSize]=100`,
  );
  const json = await handleResponse<{ data: StrapiTarget[] }>(res);
  return json.data;
}

export async function createTarget(payload: TargetPayload): Promise<StrapiTarget> {
  const res = await fetch(`${STRAPI_URL}/api/targets`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ data: payload }),
  });
  const json = await handleResponse<{ data: StrapiTarget }>(res);
  return json.data;
}

// ── API : Incident Types ──────────────────────────────────────────────────

export async function listIncidentTypes(targetDocumentId: string): Promise<StrapiIncidentType[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/incident-types?filters[target][documentId][$eq]=${targetDocumentId}&sort=name:asc&pagination[pageSize]=100`,
  );
  const json = await handleResponse<{ data: StrapiIncidentType[] }>(res);
  return json.data;
}

export async function createIncidentType(
  name:             string,
  targetDocumentId: string,
): Promise<StrapiIncidentType> {
  const res = await fetch(`${STRAPI_URL}/api/incident-types`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ data: { name, target: targetDocumentId } }),
  });
  const json = await handleResponse<{ data: StrapiIncidentType }>(res);
  return json.data;
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
    body:    JSON.stringify({ data: { name, version: 1 } }),
  });
  const json = await handleResponse<{ data: StrapiTree }>(res);
  return json.data;
}

// ── API : sauvegarder les nœuds et liens d'un arbre ──────────────────────
export async function saveTree(
  documentId: string,
  payload:    SaveTreePayload,
): Promise<StrapiTree> {
  const res = await fetch(
    `${STRAPI_URL}/api/decision-trees/${documentId}/save-tree`,
    {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        nodes:          payload.nodes,
        edges:          payload.edges,
        incidentTypeId: payload.incidentTypeId,  // ← transmis au contrôleur Strapi
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
      body:    JSON.stringify({ data: { publishedAt: new Date().toISOString() } }),
    },
  );
  const json = await handleResponse<{ data: StrapiTree }>(res);
  return json.data;
}

// ── API : charger un arbre existant ──────────────────────────────────────
//
// Strapi v5 : le populate ne remonte pas les relations oneToMany quand les
// content-types enfants ont draftAndPublish=false et le parent =true.
// Solution : 3 requêtes séparées (tree metadata, nodes, edges).
//
export async function loadTree(documentId: string): Promise<{
  tree:  StrapiTree;
  nodes: Node[];
  edges: Edge[];
}> {
  // ── 1. Métadonnées de l'arbre + incident_type (avec son target) ──────────
  // Note Strapi v5 : GET /:id?populate=... retourne 404 sur certains arbres.
  // Workaround : passer par la liste filtrée sur documentId, qui fonctionne.
  const treeRes = await fetch(
    `${STRAPI_URL}/api/decision-trees` +
    `?filters[documentId][$eq]=${documentId}` +
    `&populate[incident_type][populate][0]=target` +
    `&pagination[pageSize]=1`,
  );
  const treeJson = await handleResponse<{ data: Record<string, unknown>[] }>(treeRes);
  if (!treeJson.data || treeJson.data.length === 0) {
    throw new Error(`Arbre introuvable : ${documentId}`);
  }
  const raw = treeJson.data[0];

  // ── 2. Nœuds liés à cet arbre (requête directe, contourne draftAndPublish) ─
  type RawNode = {
    nodeId:     string;
    type:       string;
    label?:     string;
    content?:   Record<string, unknown>;
    positionX?: number;
    positionY?: number;
  };

  const nodesRes = await fetch(
    `${STRAPI_URL}/api/decision-nodes` +
    `?filters[decision_tree][documentId][$eq]=${documentId}` +
    `&pagination[pageSize]=500` +
    `&sort=createdAt:asc`,
  );
  const nodesJson = await handleResponse<{ data: RawNode[] }>(nodesRes);

  // ── 3. Arêtes liées à cet arbre ──────────────────────────────────────────
  type RawEdge = {
    edgeId:  string;
    source:  string;
    target:  string;
    label?:  string;
  };

  const edgesRes = await fetch(
    `${STRAPI_URL}/api/decision-edges` +
    `?filters[decision_tree][documentId][$eq]=${documentId}` +
    `&pagination[pageSize]=500` +
    `&sort=createdAt:asc`,
  );
  const edgesJson = await handleResponse<{ data: RawEdge[] }>(edgesRes);

  // ── 4. Conversion vers le format React Flow ───────────────────────────────
  const nodes: Node[] = nodesJson.data.map((n) => ({
    id:       n.nodeId,
    type:     n.type,
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data:     n.content ?? { label: n.label ?? '' },
  }));

  const edges: Edge[] = edgesJson.data.map((e) => {
    // Reconstruire sourceHandle : chercher l'index de l'option dont le label
    // correspond au label de l'arête dans le nœud source (QuestionNode).
    // Sans ça, ReactFlow connecte toutes les arêtes au handle par défaut.
    let sourceHandle: string | undefined;
    const sourceNode = nodes.find((n) => n.id === e.source);
    if (sourceNode?.type === 'question') {
      const opts = (sourceNode.data as { options?: { label: string }[] })?.options;
      if (opts) {
        const idx = opts.findIndex((o) => o.label === e.label);
        if (idx >= 0) sourceHandle = `option-${idx}`;
      }
    }
    return {
      id:       e.edgeId,
      source:   e.source,
      target:   e.target,
      label:    e.label ?? '',
      animated: true,
      ...(sourceHandle !== undefined ? { sourceHandle } : {}),
    };
  });

  console.log(`[loadTree] ${documentId} → ${nodes.length} nœuds, ${edges.length} arêtes`);

  return { tree: raw as unknown as StrapiTree, nodes, edges };
}
