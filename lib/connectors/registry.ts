import type { ConnectorDefinition } from "./types";

export const connectorRegistry: ConnectorDefinition[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Receive reminders and manage tasks directly from WhatsApp.",
    iconId: "whatsapp",
    type: "code",
    category: "messaging",
    badges: [
      { label: "AI Tools", icon: "ai" },
      { label: "Automations", icon: "automations" },
      { label: "Commands", icon: "commands" },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description:
      "Read, send, and organize emails without leaving your workflow.",
    iconId: "gmail",
    type: "oauth",
    category: "email",
    badges: [
      { label: "AI Tools", icon: "ai" },
      { label: "Automations", icon: "automations" },
      { label: "Connected Search", icon: "search" },
      { label: "Commands", icon: "commands" },
    ],
  },
  {
    id: "googleCalendar",
    name: "Google Calendar",
    description:
      "Sync reminders with your Google Calendar automatically.",
    iconId: "googleCalendar",
    type: "oauth",
    category: "calendar",
    badges: [
      { label: "Automations", icon: "automations" },
      { label: "Connected Search", icon: "search" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "Get notified about issues, PRs, and CI/CD events.",
    iconId: "github",
    type: "oauth",
    category: "devtools",
    comingSoon: true,
    badges: [
      { label: "AI Tools", icon: "ai" },
      { label: "Automations", icon: "automations" },
      { label: "Commands", icon: "commands" },
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    description:
      "Track mentions, DMs, and scheduled posts.",
    iconId: "x",
    type: "oauth",
    category: "social",
    comingSoon: true,
    badges: [
      { label: "AI Tools", icon: "ai" },
      { label: "Automations", icon: "automations" },
    ],
  },
];
