import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
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
  Target,
  Wallet,
  Waypoints,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string; // Matrix lore name — front and center
  subLabel?: string; // technical description — quiet line underneath
  tagline: string; // legacy prop, kept for back-compat (sublabel preferred)
  icon: LucideIcon;
  group: "bootstrap" | "primary" | "connect" | "ops" | "insight";
  accent?: "ion" | "nebula" | "quantum" | "solar";
}

// Matrix universe rebrand — each module renamed after a character / place /
// concept from the trilogy, while keeping the technical description within
// reach for developers.
export const navItems: NavItem[] = [
  {
    href: "/blueprints",
    label: "The Keymaker",
    subLabel: "Blueprints · Ideas",
    tagline: "fikirden uca kurulumuna",
    icon: Rocket,
    group: "bootstrap",
    accent: "solar",
  },
  {
    href: "/",
    label: "The Construct",
    subLabel: "Command Deck",
    tagline: "bugünün nabzı",
    icon: LayoutGrid,
    group: "primary",
    accent: "ion",
  },
  {
    href: "/vision",
    label: "The Prime Program",
    subLabel: "Vision & Strategy",
    tagline: "şirketin DNA'sı",
    icon: Compass,
    group: "primary",
    accent: "nebula",
  },
  {
    href: "/org",
    label: "The Architect",
    subLabel: "Org Studio",
    tagline: "organizasyon şeması",
    icon: Network,
    group: "primary",
    accent: "ion",
  },
  {
    href: "/library",
    label: "The Archive",
    subLabel: "Library",
    tagline: "skills · agents · workflows",
    icon: LibraryIcon,
    group: "primary",
  },
  {
    href: "/workflows",
    label: "The Loading Program",
    subLabel: "Workflow Canvas",
    tagline: "görsel otomasyon",
    icon: Waypoints,
    group: "primary",
  },
  {
    href: "/connectors",
    label: "TrainStation",
    subLabel: "Connector Hub",
    tagline: "entegrasyonlar · fiziksel köprüler",
    icon: Plug,
    group: "connect",
    accent: "ion",
  },
  {
    href: "/models",
    label: "The Source",
    subLabel: "Model Library",
    tagline: "her zihnin kökeni",
    icon: Database,
    group: "connect",
    accent: "nebula",
  },
  {
    href: "/spend",
    label: "The Tribute",
    subLabel: "Spend & Budget",
    tagline: "maliyet · bütçe · ROI",
    icon: Wallet,
    group: "connect",
    accent: "solar",
  },
  {
    href: "/traction",
    label: "Captain's Log",
    subLabel: "Traction · Goals · EOS",
    tagline: "rocks · scorecard · L10 · prophecy",
    icon: ScrollText,
    group: "ops",
    accent: "nebula",
  },
  {
    href: "/operator",
    label: "The Operator",
    subLabel: "Task Board",
    tagline: "dijital + fiziksel görevler",
    icon: ClipboardList,
    group: "ops",
    accent: "ion",
  },
  {
    href: "/prime",
    label: "Prime Program",
    subLabel: "Daily/Weekly Rituals",
    tagline: "L10 · weekly review · deep work",
    icon: Repeat,
    group: "ops",
    accent: "nebula",
  },
  {
    href: "/control",
    label: "Nebuchadnezzar",
    subLabel: "Control Room",
    tagline: "canlı operasyon",
    icon: Activity,
    group: "ops",
    accent: "solar",
  },
  {
    href: "/insights",
    label: "The Truth",
    subLabel: "Insights",
    tagline: "kaldıraç & retro",
    icon: BarChart3,
    group: "insight",
  },
  {
    href: "/codex",
    label: "The Codex",
    subLabel: "User Guide · Manual",
    tagline: "her modülün ne · niçin · nasıl",
    icon: HelpCircle,
    group: "insight",
    accent: "nebula",
  },
];
