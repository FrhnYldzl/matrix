/**
 * Prisma seed — mock-data.ts → Postgres.
 *
 * Run with: npm run db:seed
 *
 * Idempotent-ish: workspace bazında upsert, nested tablolar delete+createMany.
 * İlk kurulum sonrası prod'da tekrar çalıştırılırsa mevcut veri üzerine
 * yazılmaz (yeni workspace yoksa nested'lar yeniden yaratılır — dev'de ok).
 */

import { PrismaClient } from "@prisma/client";
import {
  agents as seedAgents,
  approvals as seedApprovals,
  auditLog as seedAudit,
  departments as seedDepartments,
  goals as seedGoals,
  skills as seedSkills,
  workflows as seedWorkflows,
  workspaces as seedWorkspaces,
} from "../src/lib/mock-data";
import {
  rocks as seedRocks,
  scorecardRows as seedScorecard,
  issues as seedIssues,
  accountabilityRoles as seedAccountability,
} from "../src/lib/traction";
import { costLog as seedCostLog, getBudgetsWithSpend } from "../src/lib/costs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Matrix seed başlıyor...\n");

  // 1) Founder user
  const ferhan = await db.user.upsert({
    where: { email: "ferhan@matrix.local" },
    update: {},
    create: {
      email: "ferhan@matrix.local",
      name: "Ferhan Yıldızlı",
      role: "FOUNDER",
    },
  });
  console.log(`✓ User: ${ferhan.email}`);

  // 2) Workspaces
  for (const ws of seedWorkspaces) {
    await db.workspace.upsert({
      where: { slug: ws.id },
      update: {
        name: ws.name,
        industry: ws.industry,
        mission: ws.mission,
        vision: ws.vision,
        accent: ws.accent,
      },
      create: {
        slug: ws.id,
        name: ws.name,
        shortName: ws.shortName,
        industry: ws.industry,
        mission: ws.mission,
        vision: ws.vision,
        accent: ws.accent,
      },
    });

    const wsRec = await db.workspace.findUnique({ where: { slug: ws.id } });
    if (!wsRec) continue;

    await db.strategicTheme.deleteMany({ where: { workspaceId: wsRec.id } });
    await db.strategicTheme.createMany({
      data: ws.strategicThemes.map((t) => ({
        workspaceId: wsRec.id,
        label: t.label,
        description: t.description,
        weight: t.weight,
      })),
    });

    await db.valueAnchor.deleteMany({ where: { workspaceId: wsRec.id } });
    await db.valueAnchor.createMany({
      data: ws.valueAnchors.map((v) => ({
        workspaceId: wsRec.id,
        label: v.label,
        description: v.description,
      })),
    });

    await db.workspaceMember.upsert({
      where: {
        userId_workspaceId: { userId: ferhan.id, workspaceId: wsRec.id },
      },
      update: {},
      create: { userId: ferhan.id, workspaceId: wsRec.id, role: "owner" },
    });
  }
  console.log(`✓ Workspaces: ${seedWorkspaces.length}`);

  const wsIdMap = new Map<string, string>();
  const wsRows = await db.workspace.findMany();
  for (const w of wsRows) wsIdMap.set(w.slug, w.id);

  // 3) Departments — mock has: id, workspaceId, name, description, owner, health
  const deptIdMap = new Map<string, string>();
  for (const d of seedDepartments) {
    const wsId = wsIdMap.get(d.workspaceId);
    if (!wsId) continue;
    const rec = await db.department.create({
      data: {
        workspaceId: wsId,
        name: d.name,
        displayName: d.name, // mock uses name as display; mirror it
        summary: d.description,
      },
    });
    deptIdMap.set(d.id, rec.id);
  }
  console.log(`✓ Departments: ${seedDepartments.length}`);

  // 4) Agents — mock has: id, workspaceId, departmentId, name, displayName, description, model, status, scopes, skillIds, callsToday, successRate
  const agentIdMap = new Map<string, string>();
  for (const a of seedAgents) {
    const wsId = wsIdMap.get(a.workspaceId);
    if (!wsId) continue;
    const rec = await db.agent.create({
      data: {
        workspaceId: wsId,
        departmentId: a.departmentId ? deptIdMap.get(a.departmentId) : null,
        name: a.name,
        displayName: a.displayName,
        role: "agent", // mock doesn't have role, default
        summary: a.description,
        status:
          a.status === "live"
            ? "LIVE"
            : a.status === "paused"
            ? "PAUSED"
            : "DRAFT",
      },
    });
    agentIdMap.set(a.id, rec.id);
  }
  console.log(`✓ Agents: ${seedAgents.length}`);

  // 5) Skills — mock has: id, workspaceId, ownerAgentId, name, displayName, triggers, description, runsThisWeek, goldenTestPassing
  for (const s of seedSkills) {
    const wsId = wsIdMap.get(s.workspaceId);
    if (!wsId) continue;
    await db.skill.create({
      data: {
        workspaceId: wsId,
        name: s.name,
        displayName: s.displayName,
        summary: s.description,
        scopes: [],
      },
    });
  }
  console.log(`✓ Skills: ${seedSkills.length}`);

  // 6) Workflows — mock has: id, workspaceId, departmentId, name, cadence, nextRun, lastStatus, steps, ...
  for (const w of seedWorkflows) {
    const wsId = wsIdMap.get(w.workspaceId);
    if (!wsId) continue;
    await db.workflow.create({
      data: {
        workspaceId: wsId,
        name: w.name,
        displayName: w.name,
        cadence: w.cadence,
        description: w.description,
        lastStatus:
          w.lastStatus === "running"
            ? "RUNNING"
            : w.lastStatus === "success"
            ? "SUCCESS"
            : w.lastStatus === "pending-approval"
            ? "PENDING_APPROVAL"
            : w.lastStatus === "failed"
            ? "FAILED"
            : "DRAFT",
        nextRunAt: w.nextRun ? new Date(w.nextRun) : null,
      },
    });
  }
  console.log(`✓ Workflows: ${seedWorkflows.length}`);

  // 7) Goals — mock has: id, workspaceId, title, target, current, unit, trajectory, theme, ...
  for (const g of seedGoals) {
    const wsId = wsIdMap.get(g.workspaceId);
    if (!wsId) continue;
    await db.goal.create({
      data: {
        workspaceId: wsId,
        title: g.title,
        target: g.target,
        current: g.current,
        unit: g.unit,
        trajectory: g.trajectory,
      },
    });
  }
  console.log(`✓ Goals: ${seedGoals.length}`);

  // 8) Rocks
  for (const r of seedRocks) {
    const wsId = wsIdMap.get(r.workspaceId);
    if (!wsId) continue;
    await db.rock.create({
      data: {
        workspaceId: wsId,
        quarter: r.quarter,
        title: r.title,
        description: r.description,
        ownerName: r.ownerName,
        ownerRole: r.ownerRole,
        ownerKind: r.ownerKind,
        status: r.status,
        progressPct: r.progressPct,
        milestones: r.milestones as unknown as object,
      },
    });
  }
  console.log(`✓ Rocks: ${seedRocks.length}`);

  // 9) Scorecard
  for (const s of seedScorecard) {
    const wsId = wsIdMap.get(s.workspaceId);
    if (!wsId) continue;
    await db.scorecardRow.create({
      data: {
        workspaceId: wsId,
        metric: s.metric,
        ownerName: s.ownerName,
        unit: s.unit,
        target: s.target,
        trend: s.trend,
        weekly: s.weekly as unknown as object,
      },
    });
  }
  console.log(`✓ Scorecard: ${seedScorecard.length}`);

  // 10) Issues
  for (const i of seedIssues) {
    const wsId = wsIdMap.get(i.workspaceId);
    if (!wsId) continue;
    await db.issue.create({
      data: {
        workspaceId: wsId,
        title: i.title,
        raisedBy: i.raisedBy,
        raisedAt: new Date(i.raisedAtIso),
        category: i.category,
        ids: i.ids,
        priority: i.priority,
        assigneeName: i.assigneeName,
        note: i.note,
      },
    });
  }
  console.log(`✓ Issues: ${seedIssues.length}`);

  // 11) Accountability
  for (const r of seedAccountability) {
    const wsId = wsIdMap.get(r.workspaceId);
    if (!wsId) continue;
    await db.accountabilityRole.create({
      data: {
        workspaceId: wsId,
        role: r.role,
        ownerName: r.ownerName,
        ownerKind: r.ownerKind,
        topAccountabilities: r.topAccountabilities,
        sits: r.sits,
      },
    });
  }
  console.log(`✓ Accountability: ${seedAccountability.length}`);

  // 12) Audit events — mock has: id, workspaceId, at, who, action, target, success (different shape!)
  //     We'll normalize into our new AuditEvent schema:
  //
  //   - actorKind ← "agent" (best guess from mock)
  //   - actorName ← who
  //   - eventType ← action
  //   - result ← success ? "success" : "fail"
  //   - timestamp ← at
  const recentAudit = seedAudit.slice(-200);
  for (const e of recentAudit) {
    const wsId = wsIdMap.get(e.workspaceId);
    if (!wsId) continue;
    // Use unknown intermediate to bypass shape-mismatch — field names differ
    const ev = e as unknown as {
      who?: string;
      action?: string;
      success?: boolean;
      at?: string;
      target?: string;
      actorKind?: string;
      actorName?: string;
      eventType?: string;
      result?: string;
      timestamp?: string;
      payload?: object;
    };
    await db.auditEvent.create({
      data: {
        workspaceId: wsId,
        actorKind: ev.actorKind ?? "agent",
        actorName: ev.actorName ?? ev.who ?? "unknown",
        eventType: ev.eventType ?? ev.action ?? "unknown",
        result:
          ev.result ?? (ev.success === false ? "fail" : "success"),
        payload: (ev.payload ?? { target: ev.target }) as object,
        timestamp: new Date(ev.timestamp ?? ev.at ?? Date.now()),
      },
    });
  }
  console.log(`✓ Audit events: ${recentAudit.length}`);

  // 13) Approvals — mock ApprovalItem may have different shape than new schema
  for (const a of seedApprovals) {
    const wsId = wsIdMap.get(a.workspaceId);
    if (!wsId) continue;
    const ap = a as unknown as {
      actorKind?: string;
      actorName?: string;
      actionLabel?: string;
      actionBody?: string;
      scope?: string;
      agent?: string;
      title?: string;
      body?: string;
    };
    await db.approval.create({
      data: {
        workspaceId: wsId,
        actorKind: ap.actorKind ?? "agent",
        actorName: ap.actorName ?? ap.agent ?? "unknown",
        actionLabel: ap.actionLabel ?? ap.title ?? "pending-action",
        actionBody: ap.actionBody ?? ap.body ?? "",
        scope: ap.scope ?? "external-send",
        status: "PENDING",
      },
    });
  }
  console.log(`✓ Approvals: ${seedApprovals.length}`);

  // 14) Cost entries
  for (const c of seedCostLog) {
    const wsId = wsIdMap.get(c.workspaceId);
    if (!wsId) continue;
    const ce = c as unknown as {
      connectorId: string;
      actorKind?: string;
      actorId?: string;
      actorName: string;
      kind: string;
      amountUsd?: number;
      usd?: number;
      metadata?: object;
      timestamp?: string;
      at?: string;
      traceId?: string;
    };
    await db.costEntry.create({
      data: {
        workspaceId: wsId,
        connectorId: ce.connectorId,
        actorKind: ce.actorKind ?? "agent",
        actorId: ce.actorId,
        actorName: ce.actorName,
        kind: ce.kind,
        amountUsd: ce.amountUsd ?? ce.usd ?? 0,
        metadata: (ce.metadata ?? {}) as object,
        timestamp: new Date(ce.timestamp ?? ce.at ?? Date.now()),
        traceId: ce.traceId,
      },
    });
  }
  console.log(`✓ Cost entries: ${seedCostLog.length}`);

  // 15) Budgets
  for (const w of wsRows) {
    const budgets = getBudgetsWithSpend(w.slug);
    for (const b of budgets) {
      const bd = b as unknown as {
        scopeKind?: string;
        scope?: string;
        scopeId?: string;
        monthlyLimitUsd?: number;
        limitUsd?: number;
        alertAt?: number;
      };
      await db.budget.create({
        data: {
          workspaceId: w.id,
          scopeKind: bd.scopeKind ?? bd.scope ?? "workspace",
          scopeId: bd.scopeId,
          monthlyLimitUsd: bd.monthlyLimitUsd ?? bd.limitUsd ?? 0,
          alertAt: bd.alertAt ?? 0.8,
        },
      });
    }
  }
  console.log(`✓ Budgets seeded per workspace`);

  // 16) System state
  await db.systemState.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", killSwitchArmed: false },
  });
  console.log(`✓ System state\n`);

  console.log("🎬 Matrix seed tamamlandı.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
