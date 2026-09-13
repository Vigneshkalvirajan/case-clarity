import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { evidenceTypeLabel, shortHash, titleCase, toPercent } from "@/lib/format";

/* ----------------------------------------------------------- labels & rules */

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("label-caps", className)}>{children}</div>;
}

/* --------------------------------------------------------------------- pills */

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "destructive" | "ai";

const toneClass: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  primary: "bg-primary-soft text-primary border-primary/20",
  accent: "bg-accent-soft text-accent border-accent/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  destructive: "bg-destructive-soft text-destructive border-destructive/25",
  ai: "bg-ai-soft text-ai border-ai/20",
};

const dotClass: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  ai: "bg-ai",
};

export function Pill({
  tone = "neutral",
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dotClass[tone])} /> : null}
      {children}
    </span>
  );
}

function processingTone(status?: string | null): Tone {
  switch ((status ?? "").toLowerCase()) {
    case "indexed":
    case "completed":
    case "normalized":
      return "success";
    case "processing":
    case "queued":
    case "uploaded":
      return "accent";
    case "failed":
      return "destructive";
    default:
      return "neutral";
  }
}

export function ProcessingPill({ status }: { status?: string | null }) {
  const tone = processingTone(status);
  const isBusy = ["processing", "queued"].includes((status ?? "").toLowerCase());
  return (
    <Pill tone={tone} dot>
      <span className={isBusy ? "animate-pulse" : undefined}>{titleCase(status)}</span>
    </Pill>
  );
}

export function IntegrityPill({ status }: { status?: string | null }) {
  const key = (status ?? "unknown").toLowerCase();
  const tone: Tone =
    key === "verified" ? "success" : key === "mismatch" ? "destructive" : key === "pending" ? "warning" : "neutral";
  return (
    <Pill tone={tone} dot>
      {titleCase(status ?? "unknown")}
    </Pill>
  );
}

export function SeverityPill({ severity }: { severity?: string | null }) {
  const key = (severity ?? "").toLowerCase();
  const tone: Tone = key === "high" ? "destructive" : key === "medium" ? "accent" : "warning";
  return <Pill tone={tone}>{titleCase(severity)} severity</Pill>;
}

export function ReviewPill({ status }: { status?: string | null }) {
  const key = (status ?? "pending").toLowerCase();
  const tone: Tone = key === "confirmed" ? "primary" : key === "dismissed" ? "neutral" : "warning";
  return (
    <Pill tone={tone} dot>
      {key === "pending" ? "Pending review" : titleCase(status)}
    </Pill>
  );
}

export function TypeTag({ type }: { type?: string | null }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {evidenceTypeLabel(type)}
    </span>
  );
}

/* ---------------------------------------------------------------- ID + hash */

export function EvidenceChip({
  evidenceId,
  recordId,
  onClick,
}: {
  evidenceId: string;
  recordId?: string | null;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-panel px-2 py-1 font-mono text-[11px] text-primary transition-colors",
        onClick ? "hover:border-primary/50 hover:bg-primary-soft" : "cursor-default",
      )}
    >
      <span className="size-1 rounded-full bg-primary" />
      {evidenceId}
      {recordId ? <span className="text-muted-foreground">· {recordId}</span> : null}
    </button>
  );
}

export function HashDisplay({ hash }: { hash?: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!hash) return <span className="font-mono text-[11px] text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-[11px] text-muted-foreground" title={hash}>
        {shortHash(hash)}
      </span>
      <button
        type="button"
        aria-label="Copy SHA-256 hash"
        className="text-muted-foreground transition-colors hover:text-primary"
        onClick={() => {
          void navigator.clipboard?.writeText(hash);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </button>
    </span>
  );
}

/* ------------------------------------------------------------- confidence */

export function ConfidenceMeter({
  confidence,
  label = "Confidence",
  tone = "primary",
}: {
  confidence?: number | null;
  label?: string;
  tone?: "primary" | "ai";
}) {
  const pct = toPercent(confidence);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-caps">{label}</span>
        <span className="font-mono text-xs font-semibold">{pct == null ? "not reported" : `${pct}%`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", tone === "ai" ? "bg-ai" : "bg-primary")}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- AI vs. investigator */

export function AiBlock({
  title = "AI / system analysis",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-ai/20 bg-ai-soft p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-ai" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ai">{title}</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">machine-generated</span>
      </div>
      {children}
    </div>
  );
}

export function InvestigatorBlock({
  title = "Investigator decision",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-primary/25 border-l-2 border-l-primary bg-panel p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{title}</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">human decision</span>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- panels */

export function Panel({
  title,
  meta,
  action,
  children,
  className,
}: {
  title?: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-panel", className)}>
      {title ? (
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {meta ? <span className="font-mono text-[11px] text-muted-foreground">{meta}</span> : null}
          {action ? <div className="ml-auto">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/* -------------------------------------------------------------- data states */

export function LoadingState({ label = "Loading from backend…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-10">
      <span className="size-2 animate-pulse rounded-full bg-accent" />
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return (
    <div className="m-5 rounded-lg border border-destructive/25 bg-destructive-soft p-4">
      <div className="text-sm font-semibold text-destructive">Could not load this data</div>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-destructive/30 bg-panel px-3 py-1.5 text-xs font-medium text-destructive"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-display text-base font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-[52ch] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- button */

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "accent" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline: "border border-border bg-panel text-foreground hover:bg-secondary",
    ghost: "text-muted-foreground hover:text-foreground",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
