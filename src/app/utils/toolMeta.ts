import { Search, FileText, Bot, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolMeta {
  icon: LucideIcon;
  color: string;
}

const TOOL_META: Record<string, ToolMeta> = {
  search: { icon: Search, color: "var(--color-primary)" },
  file: { icon: FileText, color: "var(--color-secondary)" },
  task: { icon: Bot, color: "var(--color-accent)" },
};

export const getToolMeta = (name: string): ToolMeta => {
  return TOOL_META[name] || { icon: Terminal, color: "var(--color-text-tertiary)" };
};

