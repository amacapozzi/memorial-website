import { getConnectionStatus } from "@/actions/connections/get-connections";
import { connectorRegistry } from "@/lib/connectors";
import { ConnectorCard } from "@/components/connectors/connector-card";

const compatibleWithByLocale: Record<string, string> = {
  en: "Compatible with {feature}",
  es: "Compatible con {feature}",
};

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const status = await getConnectionStatus();
  const compatibleWithTemplate =
    compatibleWithByLocale[locale] ?? compatibleWithByLocale.en;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your services to get the most out of Memorial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {connectorRegistry.map((connector) => {
          const connStatus =
            status[connector.id as keyof typeof status];
          const connected = connStatus
            ? "connected" in connStatus && connStatus.connected
            : false;

          return (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              connected={connected}
              compatibleWithTemplate={compatibleWithTemplate}
            />
          );
        })}
      </div>
    </div>
  );
}
