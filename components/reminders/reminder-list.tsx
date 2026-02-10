"use client";

import { ReminderWithUser } from "@/actions/reminders";
import { ReminderCard } from "./reminder-card";
import { Bell } from "lucide-react";

export function ReminderList({ reminders }: { reminders: ReminderWithUser[] }) {
  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No reminders found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create reminders by sending messages to your WhatsApp bot.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reminders.map((reminder) => (
        <ReminderCard key={reminder.id} reminder={reminder} />
      ))}
    </div>
  );
}
