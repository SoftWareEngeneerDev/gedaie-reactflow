import React, { useCallback, useState } from 'react';
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
import { createTree, saveTree, publishTree, loadTree, listTrees } from './strapiService';

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition }         = useReactFlow();

  // Nœud actuellement sélectionné (panneau de config)
  const [selectedNode, setSelectedNode]  = useState<Node | null>(null);

  // État Strapi
  const [treeName,    setTreeName]   = useState('');
  const [documentId,  setDocumentId] = useState('');
  const [saveStatus,  setSaveStatus] = useState<SaveStatus>('idle');
  const [savedTrees,  setSavedTrees] = useState<TreeSummary[]>([]);
  const [errorMsg,    setErrorMsg]   = useState('');

  // Rafraîchir la liste des arbres depuis Strapi
  const refreshTrees = useCallback(() => {
    listTrees()
      .then((trees) => setSavedTrees(trees.map((t) => ({ documentId: t.documentId, name: t.name }))))
      .catch(() => {});
  }, []);

  // Charger la liste des arbres au démarrage
  React.useEffect(() => { refreshTrees(); }, [refreshTrees]);

  // Connexion entre deux nœuds via drag depuis un handle
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  );

  // Sélectionner un nœud → ouvrir le panneau de config
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  // Clic sur le fond → désélectionner
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Mettre à jour les données d'un nœud depuis le panneau
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => n.id === nodeId ? { ...n, data: newData } : n)
      );
      // Sync le nœud sélectionné pour que le panneau se mette à jour en live
      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: newData } : prev
      );
    },
    [setNodes],
  );

  // Supprimer un nœud et toutes ses connexions
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
    },
    [setNodes, setEdges],
  );

  // ── Handlers Strapi ──────────────────────────────────────────────────────

  // Sauvegarder : crée l'arbre si nouveau, puis envoie nodes+edges
  const handleSave = useCallback(async () => {
    if (!treeName.trim()) return;
    setSaveStatus('saving');
    setErrorMsg('');
    try {
      let id = documentId;
      // Si pas encore d'ID → créer l'arbre dans Strapi
      if (!id) {
        const tree = await createTree(treeName.trim());
        id = tree.documentId;
        setDocumentId(id);
      }
      await saveTree(id, { nodes, edges });
      setSaveStatus('saved');
      refreshTrees(); // Rafraîchit le dropdown avec le nouvel arbre
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[handleSave]', msg);
      setErrorMsg(msg);
      setSaveStatus('error');
      setTimeout(() => { setSaveStatus('idle'); setErrorMsg(''); }, 8000);
    }
  }, [treeName, documentId, nodes, edges, refreshTrees]);

  // Charger un arbre existant depuis Strapi
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

  // Publier : rend l'arbre visible côté Angular (status published)
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

  // Autoriser le drop sur le canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Créer un nouveau nœud au drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Convertit les coordonnées écran → coordonnées canvas
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

      {/* Barre du haut — nom + save + publish */}
      {/* Bandeau d'erreur détaillé (visible 8 s) */}
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
      <TopBar
        treeName={treeName}
        documentId={documentId}
        saveStatus={saveStatus}
        savedTrees={savedTrees}
        onNameChange={setTreeName}
        onSave={handleSave}
        onPublish={handlePublish}
        onLoad={handleLoad}
        onClear={() => { setNodes([]); setEdges([]); setSelectedNode(null); }}
      />

      {/* Corps : toolbar + canvas + config panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Barre d'outils gauche */}
      <Toolbar />

      {/* Canvas React Flow */}
      <div style={{ flex: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
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
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </div>

      {/* Panneau de configuration à droite */}
      <NodeConfigPanel
        node={selectedNode}
        onChange={onNodeDataChange}
        onDelete={handleDeleteNode}
      />
      </div>
    </div>
  );
}

// ── Export — ReactFlowProvider requis pour useReactFlow() ─────────────────
export default function FlowCanvasReact() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
