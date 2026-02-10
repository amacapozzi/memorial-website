import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function seedPlans() {
  console.log("Seeding plans...");

  const starter = await prisma.plan.upsert({
    where: { id: "starter" },
    update: {
      name: "Starter",
      description: "Plan inicial con recordatorios ilimitados",
      priceMonthly: 99900,
      priceYearly: 999900,
      currency: "ARS",
      features: ["Recordatorios", "Recurrentes", "Web", "Bot"],
      maxReminders: null,
      maxEmailAccounts: 0,
      hasCalendarSync: false,
      hasEmailSync: false,
      trialDays: 7,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: "starter",
      name: "Starter",
      description: "Plan inicial con recordatorios ilimitados",
      priceMonthly: 99900,
      priceYearly: 999900,
      currency: "ARS",
      features: ["Recordatorios", "Recurrentes", "Web", "Bot"],
      maxReminders: null,
      maxEmailAccounts: 0,
      hasCalendarSync: false,
      hasEmailSync: false,
      trialDays: 7,
      sortOrder: 1,
      isActive: true,
    },
  });

  const pro = await prisma.plan.upsert({
    where: { id: "pro" },
    update: {
      name: "Pro",
      description: "Plan completo con todas las integraciones",
      priceMonthly: 199900,
      priceYearly: 1999900,
      currency: "ARS",
      features: [
        "Todo de Starter",
        "Gmail",
        "Calendar",
        "Conectores",
        "Soporte prioritario",
      ],
      maxReminders: null,
      maxEmailAccounts: 3,
      hasCalendarSync: true,
      hasEmailSync: true,
      trialDays: 7,
      sortOrder: 2,
      isActive: true,
    },
    create: {
      id: "pro",
      name: "Pro",
      description: "Plan completo con todas las integraciones",
      priceMonthly: 199900,
      priceYearly: 1999900,
      currency: "ARS",
      features: [
        "Todo de Starter",
        "Gmail",
        "Calendar",
        "Conectores",
        "Soporte prioritario",
      ],
      maxReminders: null,
      maxEmailAccounts: 3,
      hasCalendarSync: true,
      hasEmailSync: true,
      trialDays: 7,
      sortOrder: 2,
      isActive: true,
    },
  });

  console.log("Plans seeded:", { starter: starter.id, pro: pro.id });
}

seedPlans()
  .catch((e) => {
    console.error("Failed to seed plans:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
