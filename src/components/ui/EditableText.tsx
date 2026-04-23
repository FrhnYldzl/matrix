"use client";

import { cn } from "@/lib/cn";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function EditableText({
  value,
  onChange,
  placeholder,
  multiline = false,
  className,
  editorClassName,
  textClassName,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  editorClassName?: string;
  textClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft.trim());
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  if (editing) {
    const Editor = multiline ? "textarea" : "input";
    return (
      <Editor
        ref={ref as React.RefObject<HTMLTextAreaElement & HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
          if (e.key === "Enter" && !multiline) commit();
          if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) commit();
        }}
        rows={multiline ? 3 : undefined}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none rounded-md border border-ion/40 bg-elevated/60 px-3 py-2 text-text outline-none ring-2 ring-ion/30",
          editorClassName
        )}
      />
    );
  }

  const empty = !value || !value.trim();

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        "group relative block w-full cursor-text rounded-md px-3 py-2 text-left transition-colors hover:bg-elevated/40",
        className
      )}
    >
      <span className={cn("block", empty ? "text-text-faint italic" : "text-text", textClassName)}>
        {empty ? placeholder || "Boş" : value}
      </span>
      <Pencil
        size={12}
        className="pointer-events-none absolute right-2 top-2 text-text-faint opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}
