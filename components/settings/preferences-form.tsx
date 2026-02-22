"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePreferences } from "@/actions/settings";

interface NotificationStrings {
  morningBriefTitle: string;
  morningBriefDescription: string;
  dailyDigestTitle: string;
  dailyDigestDescription: string;
  digestHourTitle: string;
  digestHourDescription: string;
}

interface PreferencesFormProps {
  briefEnabled: boolean;
  digestEnabled: boolean;
  digestHour: number;
  strings: NotificationStrings;
}

export function PreferencesForm({
  briefEnabled: initialBrief,
  digestEnabled: initialDigest,
  digestHour: initialHour,
  strings,
}: PreferencesFormProps) {
  const [briefEnabled, setBriefEnabled] = useState(initialBrief);
  const [digestEnabled, setDigestEnabled] = useState(initialDigest);
  const [digestHour, setDigestHour] = useState(initialHour);
  const [, startTransition] = useTransition();

  function save(patch: Partial<{ briefEnabled: boolean; digestEnabled: boolean; digestHour: number }>) {
    const next = { briefEnabled, digestEnabled, digestHour, ...patch };
    startTransition(async () => {
      await updatePreferences(next);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="brief-toggle" className="text-sm font-medium">
            {strings.morningBriefTitle}
          </Label>
          <p className="text-sm text-muted-foreground">
            {strings.morningBriefDescription}
          </p>
        </div>
        <Switch
          id="brief-toggle"
          checked={briefEnabled}
          onCheckedChange={(checked) => {
            setBriefEnabled(checked);
            save({ briefEnabled: checked });
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="digest-toggle" className="text-sm font-medium">
            {strings.dailyDigestTitle}
          </Label>
          <p className="text-sm text-muted-foreground">
            {strings.dailyDigestDescription}
          </p>
        </div>
        <Switch
          id="digest-toggle"
          checked={digestEnabled}
          onCheckedChange={(checked) => {
            setDigestEnabled(checked);
            save({ digestEnabled: checked });
          }}
        />
      </div>

      {digestEnabled && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="digest-hour" className="text-sm font-medium">
              {strings.digestHourTitle}
            </Label>
            <p className="text-sm text-muted-foreground">
              {strings.digestHourDescription}
            </p>
          </div>
          <Select
            value={String(digestHour)}
            onValueChange={(val) => {
              const h = Number(val);
              setDigestHour(h);
              save({ digestHour: h });
            }}
          >
            <SelectTrigger id="digest-hour" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 18 }, (_, i) => i + 5).map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {String(h).padStart(2, "0")}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
