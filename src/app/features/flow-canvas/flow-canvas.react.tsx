import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
  NodeMouseHandler,
} from '@xyflow/react';
// @ts-ignore -- allow side-effect CSS import without type declarations
import '@xyflow/react/dist/style.css';

import QuestionNode from './nodes/questionNode';
import SolutionNode from './nodes/solutionNode';
import TicketNode   from './nodes/ticketNode';
import EndNode      from './nodes/endNode';
import Toolbar          from './toolbar';
import NodeConfigPanel  from './nodeConfigPanel';
import TopBar, { SaveStatus, TreeSummary } from './topBar';
import {
  createTree, saveTree, publishTree, loadTree, listTrees,
  listTargets, listIncidentTypes, createTarget, createIncidentType,
  getDevicesAndProducts,
  StrapiTarget, StrapiIncidentType, Device, Product, TargetPayload,
} from './strapiService';

// ── Types de nœuds enregistrés ────────────────────────────────────────────
const nodeTypes = {
  question: QuestionNode,
  solution: SolutionNode,
  ticket:   TicketNode,
  end:      EndNode,
};

// ── Données par défaut à la création d'un nœud ────────────────────────────
const DEFAULT_DATA: Record<string, Record<string, unknown>> = {
  question: {
    question: 'Nouvelle question ?',
    options: [{ label: 'Oui' }, { label: 'Non' }],
  },
  solution: {
    title:   'Titre de la solution',
    message: 'Décrivez la procédure ici...',
  },
  ticket: {
    message:  'Ce problème nécessite une intervention.',
    priority: 'medium',
    category: 'support',
  },
  end: {
    message: 'Merci d\'avoir utilisé la FAQ ! 🎉',
  },
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// ── Compteur d'IDs pour les nouveaux nœuds ────────────────────────────────
let nodeCounter = 10;
const nextId = () => `node_${++nodeCounter}`;

// ── Éditeur principal (doit être enfant de ReactFlowProvider) ─────────────
function FlowEditor() {
  // ── Injection polices Google ──────────────────────────────────────────────
  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap',
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
    ];
    links.forEach(href => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      document.head.appendChild(link);
    });
    // Règle CSS pour les icônes Material
    if (!document.getElementById('material-symbols-style')) {
      const style = document.createElement('style');
      style.id = 'material-symbols-style';
      style.textContent = '.material-symbols-outlined { font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24; font-family: "Material Symbols Outlined"; }';
      document.head.appendChild(style);
    }
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition }         = useReactFlow();
  const updateNodeInternals              = useUpdateNodeInternals();

  // Nœud ou arête sélectionné(e)
  const [selectedNode, setSelectedNode]  = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge]  = useState<Edge | null>(null);

  // ── État Strapi — arbre ──────────────────────────────────────────────────
  const [treeName,    setTreeName]   = useState('');
  const [documentId,  setDocumentId] = useState('');
  const [saveStatus,  setSaveStatus] = useState<SaveStatus>('idle');
  const [savedTrees,  setSavedTrees] = useState<TreeSummary[]>([]);
  const [errorMsg,    setErrorMsg]   = useState('');

  // ── État Strapi — contexte Target / Incident ─────────────────────────────
  const [targets,                setTargets]                = useState<StrapiTarget[]>([]);
  const [selectedTargetId,       setSelectedTargetId]       = useState('');
  const [incidentTypes,          setIncidentTypes]          = useState<StrapiIncidentType[]>([]);
  const [selectedIncidentTypeId, setSelectedIncidentTypeId] = useState('');
  const [devices,                setDevices]                = useState<Device[]>([]);
  const [products,               setProducts]               = useState<Product[]>([]);

  // ── Chargement initial ───────────────────────────────────────────────────
  const refreshTrees = useCallback(() => {
    listTrees()
      .then((trees) => setSavedTrees(trees.map((t) => ({ documentId: t.documentId, name: t.name }))))
      .catch(() => {});
  }, []);

  const refreshTargets = useCallback(() => {
    listTargets().then(setTargets).catch(() => {});
  }, []);

  React.useEffect(() => {
    refreshTrees();
    refreshTargets();
    getDevicesAndProducts()
      .then(({ devices: d, products: p }) => { setDevices(d); setProducts(p); })
      .catch(() => {});
  }, [refreshTrees, refreshTargets]);

  // ── Handlers Target / Incident ───────────────────────────────────────────

  const handleTargetChange = useCallback((targetId: string) => {
    setSelectedTargetId(targetId);
    setSelectedIncidentTypeId('');
    setIncidentTypes([]);
    if (targetId) {
      listIncidentTypes(targetId).then(setIncidentTypes).catch(() => {});
    }
  }, []);

  const handleIncidentTypeChange = useCallback((incidentId: string) => {
    setSelectedIncidentTypeId(incidentId);
  }, []);

  const handleCreateTarget = useCallback(async (payload: TargetPayload) => {
    const target = await createTarget(payload);
    setTargets((prev) => [...prev, target]);
    setSelectedTargetId(target.documentId);
    setSelectedIncidentTypeId('');
    setIncidentTypes([]);
  }, []);

  const handleCreateIncidentType = useCallback(async (name: string) => {
    if (!selectedTargetId) return;
    const incident = await createIncidentType(name, selectedTargetId);
    setIncidentTypes((prev) => [...prev, incident]);
    // Sélectionner automatiquement le nouvel incident type
    setSelectedIncidentTypeId(incident.documentId);
  }, [selectedTargetId]);

  // ── Connexions entre nœuds ───────────────────────────────────────────────
  // Si la connexion part d'un handle nommé (= option d'un QuestionNode),
  // on récupère ce nom comme label de l'arête — le FAQ viewer s'en sert
  // pour savoir vers quel nœud naviguer quand l'utilisateur choisit cette option.
  const onConnect = useCallback(
    (connection: Connection) => {
      // Résoudre le label à partir de l'index stable du handle (ex. "option-0" → "Oui")
      let label: string | undefined;
      if (connection.sourceHandle?.startsWith('option-')) {
        const idx = parseInt(connection.sourceHandle.replace('option-', ''), 10);
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const opts = (sourceNode?.data as { options?: { label: string }[] })?.options;
        label = opts?.[idx]?.label;
      } else {
        label = connection.sourceHandle ?? undefined;
      }
      setEdges((eds) => addEdge({ ...connection, animated: true, label }, eds));
    },
    [nodes, setEdges],
  );

  // ── Sélection de nœud ────────────────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);   // désélectionner l'arête si on clique un nœud
  }, []);

  // ── Sélection d'arête ────────────────────────────────────────────────────
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);   // désélectionner le nœud si on clique une arête
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // ── Modifier le label d'une arête ────────────────────────────────────────
  const handleEdgeLabelChange = useCallback((edgeId: string, label: string) => {
    setEdges((eds) => eds.map((e) => e.id === edgeId ? { ...e, label } : e));
    setSelectedEdge((prev) => prev?.id === edgeId ? { ...prev, label } : prev);
  }, [setEdges]);

  // ── Supprimer une arête ───────────────────────────────────────────────────
  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  // ── Mise à jour des données d'un nœud ────────────────────────────────────
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => n.id === nodeId ? { ...n, data: newData } : n)
      );
      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: newData } : prev
      );
      // Recalculer les positions des handles après chaque modification des données
      // (indispensable quand le nombre d'options change)
      updateNodeInternals(nodeId);
    },
    [setNodes, updateNodeInternals],
  );

  // ── Suppression d'un nœud ────────────────────────────────────────────────
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
    },
    [setNodes, setEdges],
  );

  // ── Sauvegarder ──────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!treeName.trim()) return;
    setSaveStatus('saving');
    setErrorMsg('');
    try {
      let id = documentId;
      if (!id) {
        const tree = await createTree(treeName.trim());
        id = tree.documentId;
        setDocumentId(id);
      }
      // Passer l'incidentTypeId pour lier l'arbre à son contexte
      await saveTree(id, {
        nodes,
        edges,
        incidentTypeId: selectedIncidentTypeId || undefined,
      });
      setSaveStatus('saved');
      refreshTrees();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[handleSave]', msg);
      setErrorMsg(msg);
      setSaveStatus('error');
      setTimeout(() => { setSaveStatus('idle'); setErrorMsg(''); }, 8000);
    }
  }, [treeName, documentId, nodes, edges, selectedIncidentTypeId, refreshTrees]);

  // ── Charger un arbre existant ────────────────────────────────────────────
  const handleLoad = useCallback(async (id: string) => {
    setSaveStatus('saving');
    setErrorMsg('');
    try {
      const { tree, nodes: loadedNodes, edges: loadedEdges } = await loadTree(id);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setTreeName(tree.name);
      setDocumentId(tree.documentId);
      setSelectedNode(null);

      // Restaurer le contexte Target / Incident Type
      if (tree.incident_type) {
        setSelectedIncidentTypeId(tree.incident_type.documentId);
        const target = tree.incident_type.target;
        if (target) {
          setSelectedTargetId(target.documentId);
          listIncidentTypes(target.documentId).then(setIncidentTypes).catch(() => {});
        }
      } else {
        setSelectedIncidentTypeId('');
        setSelectedTargetId('');
        setIncidentTypes([]);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[handleLoad]', msg);
      setErrorMsg(msg);
      setSaveStatus('error');
      setTimeout(() => { setSaveStatus('idle'); setErrorMsg(''); }, 8000);
    }
  }, [setNodes, setEdges]);

  // ── Publier ───────────────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!documentId) return;
    setSaveStatus('publishing');
    try {
      await publishTree(documentId);
      setSaveStatus('published');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  }, [documentId]);

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id:       nextId(),
        type,
        position,
        data:     DEFAULT_DATA[type] ?? { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>

      {/* Bandeau d'erreur */}
      {errorMsg && (
        <div style={{
          padding:    '8px 20px',
          background: '#FEE2E2',
          color:      '#991B1B',
          fontSize:   '12px',
          fontFamily: 'monospace',
          borderBottom: '1px solid #FECACA',
          whiteSpace: 'pre-wrap',
          wordBreak:  'break-all',
        }}>
          ❌ {errorMsg}
        </div>
      )}

      {/* Barre du haut */}
      <TopBar
        treeName={treeName}
        documentId={documentId}
        saveStatus={saveStatus}
        savedTrees={savedTrees}
        targets={targets}
        selectedTargetId={selectedTargetId}
        incidentTypes={incidentTypes}
        selectedIncidentTypeId={selectedIncidentTypeId}
        devices={devices}
        products={products}
        onNameChange={setTreeName}
        onSave={handleSave}
        onPublish={handlePublish}
        onLoad={handleLoad}
        onClear={() => { setNodes([]); setEdges([]); setSelectedNode(null); setSelectedEdge(null); }}
        onTargetChange={handleTargetChange}
        onIncidentTypeChange={handleIncidentTypeChange}
        onCreateTarget={handleCreateTarget}
        onCreateIncidentType={handleCreateIncidentType}
      />

      {/* Corps : toolbar + canvas + config panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <Toolbar
          treeName={treeName}
          savedTrees={savedTrees}
          onNameChange={setTreeName}
          onLoad={handleLoad}
        />

        <div style={{ flex: 1, height: '100%', background: '#f8f9ff' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            deleteKeyCode={['Delete', 'Backspace']}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'question': return '#3B82F6';
                  case 'solution': return '#22C55E';
                  case 'ticket':   return '#F97316';
                  case 'end':      return '#94A3B8';
                  default:         return '#ccc';
                }
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
          </ReactFlow>
        </div>

        <NodeConfigPanel
          node={selectedNode}
          edge={selectedEdge}
          onChange={onNodeDataChange}
          onDelete={handleDeleteNode}
          onEdgeLabelChange={handleEdgeLabelChange}
          onEdgeDelete={handleEdgeDelete}
          onClose={() => { setSelectedNode(null); setSelectedEdge(null); }}
        />
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────
export default function FlowCanvasReact() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}

export function mountFlowCanvas(container: HTMLElement): Root {
  const root = createRoot(container);
  root.render(React.createElement(FlowCanvasReact));
  return root;
}
