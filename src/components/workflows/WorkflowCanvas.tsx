"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWorkspaceStore } from "@/lib/store";
import { workflows as seedWorkflows } from "@/lib/mock-data";
import type { Workflow } from "@/lib/types";
import { WorkflowList } from "./WorkflowList";
import { WorkflowInspector } from "./WorkflowInspector";
import { StepNode, TriggerNode } from "./nodes";
import { buildWorkflowGraph } from "./build-wf-graph";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Play, Save, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "@/lib/toast";

const nodeTypes = { trigger: TriggerNode, step: StepNode };

function WorkflowCanvasInner() {
  const { currentWorkspaceId, createdWorkflows } = useWorkspaceStore();

  const allWorkflows = useMemo<Workflow[]>(
    () => [
      ...seedWorkflows.filter((w) => w.workspaceId === currentWorkspaceId),
      ...createdWorkflows
        .filter((c) => c.entity.workspaceId === currentWorkspaceId)
        .map((c) => c.entity),
    ],
    [currentWorkspaceId, createdWorkflows]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    allWorkflows[0]?.id ?? null
  );
  useEffect(() => {
    if (!selectedId && allWorkflows.length > 0) setSelectedId(allWorkflows[0].id);
    if (selectedId && !allWorkflows.find((w) => w.id === selectedId)) {
      setSelectedId(allWorkflows[0]?.id ?? null);
    }
  }, [allWorkflows, selectedId]);

  const selected = allWorkflows.find((w) => w.id === selectedId) ?? null;

  const initial = useMemo(
    () => (selected ? buildWorkflowGraph(selected) : { nodes: [], edges: [] }),
    [selected]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
    setSelectedNode(null);
  }, [initial.nodes, initial.edges, setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback((_e, n) => setSelectedNode(n), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <WorkflowList
        workflows={allWorkflows}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            {/* Toolbar */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border/60 bg-surface/40 px-5 py-3">
              <div className="min-w-0">
                <div className="truncate font-mono text-sm text-text">
                  {selected.name}
                </div>
                <div className="mt-0.5 text-xs text-text-muted truncate">
                  {selected.description || selected.cadence}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge
                  tone={
                    selected.lastStatus === "success"
                      ? "quantum"
                      : selected.lastStatus === "running"
                      ? "ion"
                      : selected.lastStatus === "pending-approval"
                      ? "solar"
                      : "crimson"
                  }
                >
                  {selected.lastStatus}
                </Badge>
                <Badge tone="neutral">{selected.steps} adım</Badge>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    toast({
                      tone: "nebula",
                      title: "Oracle workflow önerisi",
                      description: `"${selected.name}" için 2 optimizasyon: step-3'te cost-router, step-5'te parallelizer. Detay Oracle'da.`,
                      action: { label: "Oracle'a git", href: "/oracle" },
                    })
                  }
                >
                  <Sparkles size={12} className="text-nebula" />
                  Oracle öner
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    toast({
                      tone: "ion",
                      title: "Dry-run başlatıldı",
                      description: `"${selected.name}" sandbox'ta simüle edildi — 4 adım success, toplam ~1.2s, $0.018 cost tahmini.`,
                    })
                  }
                >
                  <Play size={12} /> Dry-run
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    toast({
                      tone: "quantum",
                      title: "Golden test koştu",
                      description: "7/8 pass · 1 flaky (step-4 timing). Flaky Issues'a düştü, Ops Coordinator assignee.",
                      action: { label: "Captain's Log'da gör", href: "/traction" },
                    })
                  }
                >
                  <ShieldCheck size={12} /> Golden test
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    toast({
                      tone: "quantum",
                      title: "Workflow kaydedildi",
                      description: `"${selected.name}" · YAML snapshot alındı, audit log'a işlendi.`,
                    })
                  }
                >
                  <Save size={12} /> Kaydet
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 bg-gradient-to-br from-void via-surface/60 to-void">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.18, maxZoom: 1.1 }}
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
              </ReactFlow>
            </div>
          </>
        ) : (
          <EmptyCanvas />
        )}
      </div>

      <WorkflowInspector node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-quantum-soft text-quantum">
          <Play size={22} strokeWidth={1.4} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-text">Bu workspace'te workflow yok</h2>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">
          Library → Workflows sekmesinden yeni bir workflow oluştur, Oracle'dan kabul et veya
          dışarıdan import et.
        </p>
      </div>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
