import { LoginForm } from "@/components/auth";
import { Locale } from "@/i18n/config";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <LoginForm locale={locale} />;
}
