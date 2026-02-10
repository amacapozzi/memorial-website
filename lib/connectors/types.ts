export type ConnectorType = "code" | "oauth";
export type ConnectorCategory = "messaging" | "email" | "calendar" | "devtools" | "social";

export type ConnectorBadge = {
  label: string;
  icon: "ai" | "automations" | "search" | "commands";
};

export type ConnectorDefinition = {
  id: string;
  name: string;
  description: string;
  iconId: string;
  type: ConnectorType;
  category: ConnectorCategory;
  comingSoon?: boolean;
  badges: ConnectorBadge[];
};
