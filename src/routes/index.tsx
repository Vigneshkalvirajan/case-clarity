import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useActiveCaseId } from "@/lib/active-case";
import { formatCount, formatDateTime, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/CaseGate";
import {
  EmptyState,
  ErrorState,
  Label,
  LoadingState,
  Panel,
  Pill,
} from "@/components/forensic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Investigation Dashboard — Veritas Forensics" },
      {
        name: "description",
        content:
          "Case load, evidence processing status and recent audit activity across your digital forensic investigations.",
      },
      { property: "og:title", content: "Investigation Dashboard — Veritas Forensics" },
      {
        property: "og:description",
        content: "Case load, evidence processing status and recent audit activity.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const activeCaseId = useActiveCaseId();
  const cases = useQuery({ queryKey: ["cases"], queryFn: api.listCases, retry: false });
  const audit = useQuery({
    queryKey: ["audit", activeCaseId ?? "all"],
    queryFn: () => api.listAudit(activeCaseId ?? undefined),
    retry: false,
  });

  const total = cases.data?.length ?? 0;
  const open = cases.data?.filter((c) => (c.status ?? "").toLowerCase() === "open").length ?? 0;
  const evidenceTotal = cases.data?.reduce((sum, c) => sum + (c.evidence_count ?? 0), 0) ?? 0;
  const contradictionTotal =
    cases.data?.reduce((sum, c) => sum + (c.contradiction_count ?? 0), 0) ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Digital Forensic Investigation System"
        title="Investigation"
        accent="Dashboard"
        description="Evidence-first workspace. Every analysis, contradiction and timeline event traces back to a stored Evidence ID and its SHA-256 hash."
      />

      <div className="space-y-5 p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Cases" value={cases.isLoading ? null : formatCount(total)} />
          <Metric label="Open cases" value={cases.isLoading ? null : formatCount(open)} />
          <Metric
            label="Evidence items"
            value={cases.isLoading ? null : evidenceTotal ? formatCount(evidenceTotal) : "—"}
          />
          <Metric
            label="Contradictions"
            value={cases.isLoading ? null : contradictionTotal ? formatCount(contradictionTotal) : "—"}
            tone="accent"
          />
        </div>

        <Panel
          title="Cases"
          meta={cases.data ? `${cases.data.length} loaded` : undefined}
          action={
            <Link to="/cases" className="text-xs font-medium text-primary">
              Manage cases →
            </Link>
          }
        >
          {cases.isLoading ? <LoadingState /> : null}
          {cases.isError ? <ErrorState error={cases.error} onRetry={() => void cases.refetch()} /> : null}
          {cases.data?.length === 0 ? (
            <EmptyState
              title="No cases in the backend yet"
              description="Create a case, then upload CDR files, WhatsApp exports or statements to begin an investigation."
              action={
                <Link
                  to="/cases"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Create a case
                </Link>
              }
            />
          ) : null}
          {cases.data?.length ? (
            <ul className="divide-y divide-border">
              {cases.data.slice(0, 6).map((item) => (
                <li key={item.case_id}>
                  <Link
                    to="/cases/$caseId"
                    params={{ caseId: item.case_id }}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-background"
                  >
                    <span className="font-mono text-xs font-semibold text-primary">{item.case_id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                    {item.status ? <Pill tone="primary">{titleCase(item.status)}</Pill> : null}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatDateTime(item.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel title="Recent audit activity" meta="read-only">
          {audit.isLoading ? <LoadingState /> : null}
          {audit.isError ? <ErrorState error={audit.error} onRetry={() => void audit.refetch()} /> : null}
          {audit.data?.length === 0 ? (
            <EmptyState
              title="No audit events recorded"
              description="Case creation, evidence processing, analysis queries and report generation are logged here by the backend."
            />
          ) : null}
          {audit.data?.length ? (
            <ul className="divide-y divide-border">
              {audit.data.slice(0, 8).map((entry, i) => (
                <li key={entry.audit_id ?? i} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatDateTime(entry.timestamp)}
                  </span>
                  <span className="text-sm font-medium">{titleCase(entry.action)}</span>
                  {entry.target ? (
                    <span className="font-mono text-[11px] text-primary">{entry.target}</span>
                  ) : null}
                  {entry.actor ? (
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {entry.actor}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string | null;
  tone?: "primary" | "accent";
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <Label>{label}</Label>
      <div
        className={`mt-1 font-display text-3xl font-semibold ${
          tone === "accent" ? "text-accent" : "text-primary"
        }`}
      >
        {value ?? <span className="text-base text-muted-foreground">loading…</span>}
      </div>
    </div>
  );
}
