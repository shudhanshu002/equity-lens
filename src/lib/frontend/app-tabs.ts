import type React from "react";
import {
  BarChart3,
  Download,
  History,
  Home,
  LineChart,
  Search,
  Settings,
} from "lucide-react";

export type AppTab =
  | "home"
  | "research"
  | "compare"
  | "history"
  | "portfolio"
  | "exports"
  | "settings";

export type PublicView = "landing" | "app";

export const APP_NAV_ITEMS: {
  id: AppTab;
  label: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}[] = [
  {
    id: "home",
    label: "Home",
    description: "Product overview",
    icon: Home,
  },
  {
    id: "research",
    label: "Research",
    description: "Analyze one company",
    icon: Search,
  },
  {
    id: "compare",
    label: "Compare",
    description: "Rank companies",
    icon: BarChart3,
  },
  {
    id: "history",
    label: "History",
    description: "Saved analyses",
    icon: History,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Watchlist ideas",
    icon: LineChart,
  },
  {
    id: "exports",
    label: "Exports",
    description: "Reports and files",
    icon: Download,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Providers and theme",
    icon: Settings,
  },
];