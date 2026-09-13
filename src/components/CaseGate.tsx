import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useActiveCaseId } from "@/lib/active-case";
import { EmptyState, Panel } from "@/components/forensic";

/**
 * Investigation areas operate on one case. Without a selected case we show a
 * prompt instead of inventing data.
 */
export function CaseGate({
  area,
  children,
}: {
  area: string;
  children: (caseId: string) => ReactNode;
}) {
  const caseId = useActiveCaseId();
  if (!caseId) {
    return (
      <Panel>
        <EmptyState
          title="Select a case first"
          description={`${area} is scoped to a single case. Open a case to load its records.`}
          action={
            <Link
              to="/cases"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Go to cases
            </Link>
          }
        />
      </Panel>
    );
  }
  return <>{children(caseId)}</>;
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-border px-8 pt-8 pb-6">
      <div className="label-caps">{eyebrow}</div>
      <div className="mt-2 flex flex-wrap items-end gap-4">
        <h1 className="font-display text-4xl leading-[1.05] font-semibold text-primary">
          {title} {accent ? <span className="text-accent">{accent}</span> : null}
        </h1>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-3 max-w-[70ch] text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
