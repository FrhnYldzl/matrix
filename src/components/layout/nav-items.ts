import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  ClipboardList,
  Compass,
  Database,
  HelpCircle,
  LayoutGrid,
  Library as LibraryIcon,
  Network,
  Plug,
  Repeat,
  Rocket,
  ScrollText,
  Sparkles,
  Wallet,
  Waypoints,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string; // Matrix lore name — front and center
  subLabel?: string; // technical description — quiet line underneath
  tagline: string; // legacy prop, kept for back-compat (sublabel preferred)
  icon: LucideIcon;
  /**
   * Sidebar grouping (Sprint A — sidebar consolidation).
   *   - "pinned"    : top, never collapses (Construct + Oracle)
   *   - "workspace" : current asset's inner world (default OPEN)
   *   - "build"     : create/extend modules (default CLOSED)
   *   - "system"    : settings/system/analytics (default CLOSED)
   */
  group: "pinned" | "workspace" | "build" | "system";
  accent?: "ion" | "nebula" | "quantum" | "solar";
}

// Matrix universe rebrand — each module renamed after a character / place /
// concept from the trilogy, while keeping the technical description within
// reach for developers.
export const navItems: NavItem[] = [
  // ─── PINNED — top, always visible, en sık kullanılan 2 modül ────────
  {
    href: "/dashboard",
    label: "The Construct",
    subLabel: "Command Deck",
    tagline: "bugünün nabzı · portföy",
    icon: LayoutGrid,
    group: "pinned",
    accent: "ion",
  },
  {
    href: "/oracle",
    label: "The Oracle",
    subLabel: "Suggestions Hub · Cmd+K",
    tagline: "öneriler · sapmalar · cofounder",
    icon: Sparkles,
    group: "pinned",
    accent: "nebula",
  },

  // ─── WORKSPACE — bu asset'in iç dünyası (default OPEN) ──────────────
  {
    href: "/vision",
    label: "The Prophecy",
    subLabel: "Vision & Strategy",
    tagline: "şirketin DNA'sı · mission · themes",
    icon: Compass,
    group: "workspace",
    accent: "nebula",
  },
  {
    href: "/org",
    label: "The Architect",
    subLabel: "Org Studio",
    tagline: "organizasyon şeması",
    icon: Network,
    group: "workspace",
    accent: "ion",
  },
  {
    href: "/operator",
    label: "The Operator",
    subLabel: "Task Board",
    tagline: "dijital + fiziksel görevler",
    icon: ClipboardList,
    group: "workspace",
    accent: "ion",
  },
  {
    href: "/prime",
    label: "Prime Program",
    subLabel: "Daily/Weekly Rituals",
    tagline: "L10 · weekly review · deep work",
    icon: Repeat,
    group: "workspace",
    accent: "nebula",
  },
  {
    href: "/traction",
    label: "Captain's Log",
    subLabel: "Traction · Goals · EOS",
    tagline: "rocks · scorecard · L10 · prophecy",
    icon: ScrollText,
    group: "workspace",
    accent: "nebula",
  },

  // ─── BUILD — yeniden kullanılabilir parçalar (default CLOSED) ───────
  {
    href: "/library",
    label: "The Archive",
    subLabel: "Library",
    tagline: "skills · agents · workflows",
    icon: LibraryIcon,
    group: "build",
  },
  {
    href: "/workflows",
    label: "The Loading Program",
    subLabel: "Workflow Canvas",
    tagline: "görsel otomasyon",
    icon: Waypoints,
    group: "build",
    accent: "quantum",
  },
  {
    href: "/blueprints",
    label: "The Keymaker",
    subLabel: "Blueprints · Ideas",
    tagline: "fikirden uca kurulumuna",
    icon: Rocket,
    group: "build",
    accent: "solar",
  },

  // ─── SYSTEM — bağlantı + maliyet + kontrol + bilgi (default CLOSED) ──
  {
    href: "/connectors",
    label: "TrainStation",
    subLabel: "Connector Hub",
    tagline: "entegrasyonlar · fiziksel köprüler",
    icon: Plug,
    group: "system",
    accent: "ion",
  },
  {
    href: "/models",
    label: "The Source",
    subLabel: "Model Library",
    tagline: "her zihnin kökeni",
    icon: Database,
    group: "system",
    accent: "nebula",
  },
  {
    href: "/spend",
    label: "The Tribute",
    subLabel: "Spend & Budget",
    tagline: "maliyet · bütçe · ROI",
    icon: Wallet,
    group: "system",
    accent: "solar",
  },
  {
    href: "/control",
    label: "Nebuchadnezzar",
    subLabel: "Control Room",
    tagline: "canlı operasyon",
    icon: Activity,
    group: "system",
    accent: "solar",
  },
  {
    href: "/insights",
    label: "The Truth",
    subLabel: "Insights",
    tagline: "kaldıraç & retro",
    icon: BarChart3,
    group: "system",
  },
  {
    href: "/codex",
    label: "The Codex",
    subLabel: "User Guide · Manual",
    tagline: "her modülün ne · niçin · nasıl",
    icon: HelpCircle,
    group: "system",
    accent: "nebula",
  },
];
