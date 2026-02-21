"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CalendarPickerButton({
  dateStr,
  className,
}: {
  dateStr: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "c" || e.key === "C") {
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const selected = new Date(dateStr + "T00:00:00");

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    setOpen(false);
    router.push(`?date=${iso}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-9 gap-2 pl-3 pr-2", className)}
          aria-label="Open Calendar (C)"
        >
          <CalendarIcon className="size-4" />
          <span>Open Calendar</span>
          <span className="ml-auto hidden border-l border-border/70 pl-2 sm:inline-flex">
            <kbd className="pointer-events-none rounded border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              C
            </kbd>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-white/[0.08] bg-[#141414] shadow-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          classNames={{
            months: "flex flex-col gap-2",
            month: "flex flex-col gap-4",
            month_caption:
              "flex justify-center pt-1 relative items-center w-full",
            caption_label: "text-sm font-medium text-white/80",
            nav: "flex items-center gap-1",
            button_previous:
              "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 inline-flex items-center justify-center rounded-md border border-white/[0.08] text-white/60 hover:bg-white/[0.05]",
            button_next:
              "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 inline-flex items-center justify-center rounded-md border border-white/[0.08] text-white/60 hover:bg-white/[0.05]",
            month_grid: "w-full border-collapse space-x-1",
            weekdays: "flex",
            weekday:
              "text-white/30 rounded-md w-8 font-normal text-[0.8rem] text-center",
            week: "flex w-full mt-2",
            day: "relative p-0 text-center text-sm [&:has([aria-selected])]:rounded-md",
            day_button:
              "size-8 p-0 font-normal text-white/70 hover:bg-white/[0.08] hover:text-white rounded-md aria-selected:opacity-100 transition-colors focus-visible:outline-none",
            selected:
              "bg-gradient-to-b from-white/[0.12] to-white/[0.05] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.09),inset_0_1px_0_rgba(255,255,255,0.16)] rounded-md",
            today: "bg-white/[0.08] text-white rounded-md",
            outside: "text-white/20 opacity-50",
            disabled: "text-white/20 opacity-30",
            hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
