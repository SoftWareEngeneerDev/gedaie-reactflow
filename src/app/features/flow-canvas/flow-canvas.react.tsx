import React, { useCallback, useEffect, useState } from 'react';
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
  StrapiTarget, StrapiIncidentType,
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

// ── Nœuds et connexions de démonstration ─────────────────────────────────
const initialNodes: Node[] = [
  {
    id: 'node_1',
    type: 'question',
    position: { x: 300, y: 50 },
    data: {
      question: 'Votre imprimante est-elle sous tension ?',
      options: [
        { label: 'Oui', nextNodeId: 'node_2' },
        { label: 'Non', nextNodeId: 'node_3' },
      ],
    },
  },
  {
    id: 'node_2',
    type: 'question',
    position: { x: 100, y: 280 },
    data: {
      question: 'Y a-t-il un bourrage papier ?',
      options: [
        { label: 'Oui', nextNodeId: 'node_4' },
        { label: 'Non', nextNodeId: 'node_5' },
      ],
    },
  },
  {
    id: 'node_3',
    type: 'solution',
    position: { x: 520, y: 280 },
    data: {
      title:   "Allumer l'imprimante",
      message: "Appuyez sur le bouton d'alimentation et attendez 30 secondes.",
    },
  },
  {
    id: 'node_4',
    type: 'solution',
    position: { x: 0, y: 510 },
    data: {
      title:   'Retirer le bourrage',
      message: 'Ouvrez le capot et retirez délicatement la feuille coincée.',
    },
  },
  {
    id: 'node_5',
    type: 'ticket',
    position: { x: 300, y: 510 },
    data: {
      message:  'Le problème persiste — intervention nécessaire.',
      priority: 'high',
      category: 'hardware',
    },
  },
  {
    id: 'node_6',
    type: 'end',
    position: { x: 300, y: 740 },
    data: { message: "Merci d'avoir utilisé la FAQ ! 🎉" },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'node_1', target: 'node_2', label: 'Oui', animated: true },
  { id: 'e1-3', source: 'node_1', target: 'node_3', label: 'Non', animated: true },
  { id: 'e2-4', source: 'node_2', target: 'node_4', label: 'Oui', animated: true },
  { id: 'e2-5', source: 'node_2', target: 'node_5', label: 'Non', animated: true },
  { id: 'e3-6', source: 'node_3', target: 'node_6', animated: true },
  { id: 'e4-6', source: 'node_4', target: 'node_6', animated: true },
  { id: 'e5-6', source: 'node_5', target: 'node_6', animated: true },
];

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

  const handleCreateTarget = useCallback(async (name: string) => {
    const target = await createTarget(name);
    setTargets((prev) => [...prev, target]);
    // Sélectionner automatiquement le nouveau target
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
      const label = connection.sourceHandle ?? undefined;
      setEdges((eds) => addEdge({ ...connection, animated: true, label }, eds));
    },
    [setEdges],
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
    },
    [setNodes],
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
