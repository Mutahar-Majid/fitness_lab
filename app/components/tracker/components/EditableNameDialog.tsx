"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditableNameDialogProps {
  description: string;
  inputLabel: string;
  open: boolean;
  title: string;
  value: string;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => void;
}

export function EditableNameDialog({
  description,
  inputLabel,
  open,
  title,
  value,
  onOpenChange,
  onSave,
}: EditableNameDialogProps) {
  const [draftName, setDraftName] = useState(value);

  const trimmedName = draftName.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!trimmedName) {
              return;
            }

            onSave(trimmedName);
            onOpenChange(false);
          }}
        >
          <DialogHeader>
            <p className="eyebrow">Rename</p>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <label className="grid gap-2 text-sm font-black text-[var(--ink)]">
            {inputLabel}
            <input
              autoFocus
              className="h-12 rounded-[13px] border border-[var(--line-strong)] bg-white px-3 text-base font-bold text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--steel-blue)] focus:ring-2 focus:ring-[var(--steel-blue)]"
              onChange={(event) => setDraftName(event.target.value)}
              value={draftName}
            />
          </label>
          <DialogFooter>
            <Button disabled={!trimmedName} type="submit">
              Save name
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
