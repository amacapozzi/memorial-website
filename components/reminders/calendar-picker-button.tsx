"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CalendarPickerButton({ dateStr }: { dateStr: string }) {
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
          size="icon"
          className="relative h-[42px] w-[42px] border-0 text-white/50 hover:text-white rounded-lg bg-white/[0.035] backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.60),0_16px_34px_rgba(0,0,0,0.45)]"
          aria-label="Pick a date (C)"
        >
          <CalendarIcon className="size-4" />
          <kbd className="pointer-events-none absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded bg-white/[0.12] text-[9px] font-semibold text-white/60 border border-white/20">
            C
          </kbd>
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
