import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Compass,
  Database,
  LayoutGrid,
  Library as LibraryIcon,
  Network,
  Plug,
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
    href: "/business",
    label: "Zion's Council",
    subLabel: "Business Library",
    tagline: "iş modeli · fırsat · playbook",
    icon: BookOpenCheck,
    group: "bootstrap",
    accent: "solar",
  },
  {
    href: "/blueprints",
    label: "The Keymaker",
    subLabel: "Blueprints",
    tagline: "tek tık departman kurulumu",
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
    href: "/goals",
    label: "The Prophecy",
    subLabel: "Goals & Orbits",
    tagline: "hedef yörüngeleri",
    icon: Target,
    group: "ops",
    accent: "quantum",
  },
  {
    href: "/traction",
    label: "Captain's Log",
    subLabel: "Traction / EOS",
    tagline: "rocks · scorecard · L10",
    icon: ScrollText,
    group: "ops",
    accent: "nebula",
  },
  {
    href: "/oracle",
    label: "Oracle",
    subLabel: "AI Suggestion Engine",
    tagline: "AI öneri motoru",
    icon: Sparkles,
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
];
