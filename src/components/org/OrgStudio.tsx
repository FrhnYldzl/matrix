"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceStore } from "@/lib/store";
import { workspaces } from "@/lib/mock-data";
import { buildOrgGraph } from "./build-graph";
import { AgentNode } from "./nodes/AgentNode";
import { SkillNode } from "./nodes/SkillNode";
import { WorkflowNode } from "./nodes/WorkflowNode";
import { DepartmentNode } from "./nodes/DepartmentNode";
import { Palette } from "./Palette";
import { Inspector } from "./Inspector";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Download, Plus, Wand2 } from "lucide-react";
import { toast } from "@/lib/toast";

const nodeTypes = {
  department: DepartmentNode,
  agent: AgentNode,
  skill: SkillNode,
  workflow: WorkflowNode,
};

function OrgStudioInner() {
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const createdAgents = useWorkspaceStore((s) => s.createdAgents);
  const createdSkills = useWorkspaceStore((s) => s.createdSkills);
  const createdWorkflows = useWorkspaceStore((s) => s.createdWorkflows);
  const createdDepartments = useWorkspaceStore((s) => s.createdDepartments);
  const ws = workspaces.find((w) => w.id === wsId)!;

  const extras = useMemo(
    () => ({
      extraAgents: createdAgents.map((c) => c.entity),
      extraSkills: createdSkills.map((c) => c.entity),
      extraWorkflows: createdWorkflows.map((c) => c.entity),
      extraDepartments: createdDepartments.map((c) => c.entity),
    }),
    [createdAgents, createdSkills, createdWorkflows, createdDepartments]
  );

  const initial = useMemo(() => buildOrgGraph(wsId, extras), [wsId, extras]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selected, setSelected] = useState<Node | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // When workspace or created items change, rebuild graph
  useEffect(() => {
    const { nodes: n, edges: e } = buildOrgGraph(wsId, extras);
    setNodes(n);
    setEdges(e);
    setSelected(null);
  }, [wsId, extras, setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    setSelected(node);
  }, []);

  const onPaneClick = useCallback(() => setSelected(null), []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/matrix-node")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      const kind = e.dataTransfer.getData("application/matrix-node");
      if (!kind) return;
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const position = {
        x: e.clientX - rect.left - 100,
        y: e.clientY - rect.top - 40,
      };
      const id = `draft-${kind}-${Date.now()}`;
      const newNode: Node = {
        id,
        type: kind,
        position,
        data: placeholderData(kind),
        draggable: true,
      };
      setNodes((ns) => [...ns, newNode]);
    },
    [setNodes]
  );

  const departmentCount = nodes.filter((n) => n.type === "department").length;
  const agentCount = nodes.filter((n) => n.type === "agent").length;
  const skillCount = nodes.filter((n) => n.type === "skill").length;
  const workflowCount = nodes.filter((n) => n.type === "workflow").length;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <Palette />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Canvas toolbar */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-surface/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-text">{ws.name}</div>
            <span className="text-text-faint">·</span>
            <span className="text-xs text-text-muted">Organizasyon Şeması</span>
          </div>
          <div className="ml-3 flex items-center gap-1.5">
            <Badge tone="ion">{departmentCount} departman</Badge>
            <Badge tone="neutral">{agentCount} ajan</Badge>
            <Badge tone="nebula">{skillCount} skill</Badge>
            <Badge tone="quantum">{workflowCount} workflow</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: "nebula",
                  title: "Oracle'dan yapı önerisi alındı",
                  description: `${departmentCount} departman · ${agentCount} ajan için DNA alignment skorlandı. Boşluk önerileri Oracle'da.`,
                  action: { label: "Oracle'a git", href: "/oracle" },
                })
              }
            >
              <Wand2 size={13} className="text-nebula" />
              Oracle'dan yapı öner
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: "ion",
                  title: "Şema dışa aktarıldı",
                  description: "org-graph.json clipboard'a kopyalandı (mock). Prod'da Notion/PDF export seçenekleri eklenecek.",
                })
              }
            >
              <Download size={13} />
              Dışa aktar
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast({
                  tone: "quantum",
                  title: "Yeni departman",
                  description: "Canvas'a bir Departman node'u eklendi (mock). Gerçek create flow'u Keymaker blueprint'i üstünden.",
                  action: { label: "Keymaker'a git", href: "/blueprints" },
                })
              }
            >
              <Plus size={13} />
              Yeni departman
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="relative flex-1 bg-gradient-to-br from-void via-surface/60 to-void"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
            minZoom={0.4}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="rgba(138, 143, 168, 0.18)"
            />
            <Controls
              position="bottom-right"
              className="!bg-surface/80 !border-border/60 !backdrop-blur-md [&_button]:!bg-elevated [&_button]:!border-border/60 [&_button]:!text-text-muted hover:[&_button]:!bg-raised hover:[&_button]:!text-text"
            />
            <MiniMap
              position="bottom-left"
              pannable
              zoomable
              className="!bg-surface/80 !border-border/60 !backdrop-blur-md"
              nodeColor={(n) => {
                if (n.type === "department") return "rgba(77, 184, 255, 0.15)";
                if (n.type === "agent") return "#4db8ff";
                if (n.type === "skill") return "#9b7bff";
                if (n.type === "workflow") return "#3de0a8";
                return "#2a2e42";
              }}
              maskColor="rgba(7, 7, 12, 0.6)"
            />
          </ReactFlow>
        </div>
      </div>

      <Inspector node={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function placeholderData(kind: string) {
  const id = Date.now().toString();
  if (kind === "department")
    return {
      department: {
        id,
        workspaceId: "",
        name: "Yeni Departman",
        description: "Açıklama girilmedi.",
        owner: "—",
        health: 50,
      },
    };
  if (kind === "agent")
    return {
      agent: {
        id,
        workspaceId: "",
        departmentId: "",
        name: "yeni-agent",
        displayName: "Yeni Ajan",
        description: "Rol tanımı girilmedi.",
        model: "sonnet",
        status: "idle",
        scopes: ["read"],
        skillIds: [],
        callsToday: 0,
        successRate: 0,
      },
    };
  if (kind === "skill")
    return {
      skill: {
        id,
        workspaceId: "",
        ownerAgentId: "",
        name: "yeni-skill",
        displayName: "Yeni Skill",
        triggers: [],
        description: "",
        runsThisWeek: 0,
        goldenTestPassing: true,
      },
    };
  return {
    workflow: {
      id,
      workspaceId: "",
      departmentId: "",
      name: "new-workflow",
      cadence: "Manuel",
      nextRun: "—",
      lastStatus: "success",
      steps: 0,
    },
  };
}

export function OrgStudio() {
  return (
    <ReactFlowProvider>
      <OrgStudioInner />
    </ReactFlowProvider>
  );
}
