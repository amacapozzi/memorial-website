import { RegisterForm } from "@/components/auth";
import { Locale } from "@/i18n/config";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <RegisterForm locale={locale} />;
}
