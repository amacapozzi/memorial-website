"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchReminder = {
  id: string;
  reminderText: string;
  scheduledAt: Date;
  status: string;
};

interface SearchFormProps extends React.ComponentProps<"div"> {
  placeholder?: string;
  reminders?: SearchReminder[];
}

function formatReminderDate(date: Date): string {
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
  });
}

export function SearchForm({
  placeholder = "Search...",
  reminders = [],
  ...props
}: SearchFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement;
      const isInputLike =
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.isContentEditable;

      if (!isInputLike && event.key === "/") {
        event.preventDefault();
        setOpen(true);
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort(
        (a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt),
      ),
    [reminders],
  );

  const goToReminder = (reminder: SearchReminder) => {
    const dateIso = new Date(reminder.scheduledAt).toISOString().split("T")[0];
    const month = dateIso.slice(0, 7);
    setOpen(false);
    router.push(
      `/reminders?view=schedule&month=${month}&date=${dateIso}&reminder=${reminder.id}`,
    );
  };

  return (
    <div {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm text-[#737373] hover:bg-white/[0.05] cursor-pointer transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">{placeholder}</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-[#525252]">
                /
              </kbd>
            </button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search reminders"
        description="Find reminders and open their details."
        className="max-w-[540px] rounded-2xl border border-white/12 bg-[#101114]/95 p-0 text-white shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        <CommandInput
          placeholder="Search reminders..."
          className="text-white placeholder:text-white/45"
        />
        <CommandList className="max-h-[420px] px-2 py-2">
          <CommandEmpty className="text-white/60">
            No reminders found.
          </CommandEmpty>
          <CommandGroup
            heading="Your reminders"
            className="text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-white/55"
          >
            {sortedReminders.map((reminder) => (
              <CommandItem
                key={reminder.id}
                value={`${reminder.reminderText} ${reminder.status} ${formatReminderDate(reminder.scheduledAt)}`}
                onSelect={() => goToReminder(reminder)}
                className="group mb-1.5 rounded-lg border border-transparent px-3 py-2.5 text-white/90 data-[selected=true]:border-white/15 data-[selected=true]:bg-white/[0.09]"
              >
                <ArrowRight className="size-4 text-white/45 group-data-[selected=true]:text-white/85" />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm">
                    {reminder.reminderText}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-white/45">
                  {formatReminderDate(reminder.scheduledAt)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="flex items-center gap-2 border-t border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
          <CornerDownLeft className="size-3.5" />
          Go to reminder
        </div>
      </CommandDialog>
    </div>
  );
}
