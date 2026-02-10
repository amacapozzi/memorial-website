"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReminderWithUser, UpdateReminderState } from "@/actions/reminders";
import { updateReminder, deleteReminder, cancelReminder } from "@/actions/reminders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  SENT: "bg-green-500/20 text-green-400",
  FAILED: "bg-red-500/20 text-red-400",
  CANCELLED: "bg-neutral-500/20 text-neutral-400",
};

const recurrenceLabels: Record<string, string> = {
  NONE: "One-time",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

function toLocalDatetimeValue(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function TimelineDetailDialog({
  reminder,
  onClose,
}: {
  reminder: ReminderWithUser | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const initialState: UpdateReminderState = {};
  const [state, formAction, isPending] = useActionState(
    async (prev: UpdateReminderState, formData: FormData) => {
      const result = await updateReminder(prev, formData);
      if (result.success) {
        setEditing(false);
        router.refresh();
        onClose();
      }
      return result;
    },
    initialState
  );

  if (!reminder) return null;

  const scheduledAt = new Date(reminder.scheduledAt);
  const isPendingStatus = reminder.status === "PENDING";

  const handleCancel = async () => {
    setActionPending(true);
    const result = await cancelReminder(reminder.id);
    setActionPending(false);
    if (result.success) {
      router.refresh();
      onClose();
    }
  };

  const handleDelete = async () => {
    setActionPending(true);
    const result = await deleteReminder(reminder.id);
    setActionPending(false);
    if (result.success) {
      setDeleteOpen(false);
      router.refresh();
      onClose();
    }
  };

  return (
    <>
      <Dialog open={!!reminder} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-[#111] border-white/[0.08] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Reminder Details</DialogTitle>
            <DialogDescription className="text-white/50">
              {scheduledAt.toLocaleDateString([], {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          {!editing ? (
            /* View mode */
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[reminder.status] || statusColors.PENDING}`}
                >
                  {reminder.status}
                </span>
                <span className="text-xs text-white/40">
                  {recurrenceLabels[reminder.recurrence] || reminder.recurrence}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-white/50">
                  Reminder Text
                </p>
                <p className="text-sm text-white/90 leading-relaxed">
                  {reminder.reminderText}
                </p>
              </div>

              {reminder.originalText &&
                reminder.originalText !== reminder.reminderText && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-white/50">
                      Original Text
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {reminder.originalText}
                    </p>
                  </div>
                )}

              <div className="space-y-1">
                <p className="text-xs font-medium text-white/50">
                  Scheduled At
                </p>
                <p className="text-sm text-white/90">
                  {scheduledAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  &middot;{" "}
                  {scheduledAt.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                {isPendingStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="border-white/[0.08] text-white/70 hover:bg-white/[0.05]"
                  >
                    Edit
                  </Button>
                )}
                {isPendingStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={actionPending}
                    className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Cancel Reminder
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* Edit mode */
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="id" value={reminder.id} />

              <div className="space-y-2">
                <Label htmlFor="reminderText" className="text-white/70">
                  Reminder Text
                </Label>
                <Textarea
                  id="reminderText"
                  name="reminderText"
                  defaultValue={reminder.reminderText}
                  rows={3}
                  className="bg-white/[0.05] border-white/[0.08] text-white/90"
                />
                {state.errors?.reminderText && (
                  <p className="text-xs text-red-400">
                    {state.errors.reminderText[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledAt" className="text-white/70">
                  Scheduled At
                </Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={toLocalDatetimeValue(scheduledAt)}
                  className="bg-white/[0.05] border-white/[0.08] text-white/90"
                />
                {state.errors?.scheduledAt && (
                  <p className="text-xs text-red-400">
                    {state.errors.scheduledAt[0]}
                  </p>
                )}
              </div>

              {state.errors?._form && (
                <p className="text-xs text-red-400">
                  {state.errors._form[0]}
                </p>
              )}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="border-white/[0.08] text-white/70 hover:bg-white/[0.05]"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#111] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Reminder
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              This action cannot be undone. This will permanently delete this
              reminder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-white/70 hover:bg-white/[0.05]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={actionPending}
            >
              {actionPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
