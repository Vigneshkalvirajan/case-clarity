import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { setActiveCaseId } from "@/lib/active-case";
import { formatCount, formatDateTime, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/CaseGate";
import {
  ActionButton,
  EmptyState,
  ErrorState,
  Label,
  LoadingState,
  Panel,
  Pill,
} from "@/components/forensic";

export const Route = createFileRoute("/cases/")({
  head: () => ({
    meta: [
      { title: "Cases — Veritas Forensics" },
      {
        name: "description",
        content:
          "Open, create and switch between digital forensic investigation cases and their evidence sets.",
      },
      { property: "og:title", content: "Cases — Veritas Forensics" },
      {
        property: "og:description",
        content: "Open, create and switch between digital forensic investigation cases.",
      },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [investigator, setInvestigator] = useState("");
  const [description, setDescription] = useState("");

  const cases = useQuery({ queryKey: ["cases"], queryFn: api.listCases, retry: false });

  const create = useMutation({
    mutationFn: () =>
      api.createCase({
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(investigator.trim() ? { investigator: investigator.trim() } : {}),
      }),
    onSuccess: (created) => {
      setShowForm(false);
      setTitle("");
      setDescription("");
      setInvestigator("");
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      setActiveCaseId(created.case_id);
      void navigate({ to: "/cases/$caseId", params: { caseId: created.case_id } });
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Case register"
        title="Investigation"
        accent="Cases"
        description="Each case holds its own evidence inventory, analyses, contradictions, timeline, findings and audit trail."
        action={
          <ActionButton onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New case"}
          </ActionButton>
        }
      />

      <div className="space-y-5 p-8">
        {showForm ? (
          <Panel title="Create case">
            <form
              className="grid gap-4 p-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (title.trim()) create.mutate();
              }}
            >
              <Field label="Case title" value={title} onChange={setTitle} required />
              <Field label="Lead investigator" value={investigator} onChange={setInvestigator} />
              <div className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <ActionButton type="submit" disabled={create.isPending || !title.trim()}>
                  {create.isPending ? "Creating…" : "Create case"}
                </ActionButton>
                {create.isError ? (
                  <span className="text-xs text-destructive">
                    {create.error instanceof Error ? create.error.message : "Could not create case"}
                  </span>
                ) : null}
              </div>
            </form>
          </Panel>
        ) : null}

        <Panel title="All cases" meta={cases.data ? `${cases.data.length}` : undefined}>
          {cases.isLoading ? <LoadingState /> : null}
          {cases.isError ? <ErrorState error={cases.error} onRetry={() => void cases.refetch()} /> : null}
          {cases.data?.length === 0 ? (
            <EmptyState
              title="No cases yet"
              description="Create the first case to start uploading and processing evidence."
            />
          ) : null}
          {cases.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="label-caps px-5 py-2.5 font-medium">Case ID</th>
                    <th className="label-caps px-3 py-2.5 font-medium">Title</th>
                    <th className="label-caps px-3 py-2.5 font-medium">Status</th>
                    <th className="label-caps px-3 py-2.5 font-medium">Investigator</th>
                    <th className="label-caps px-3 py-2.5 text-right font-medium">Evidence</th>
                    <th className="label-caps px-3 py-2.5 text-right font-medium">Created</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {cases.data.map((item) => (
                    <tr key={item.case_id} className="border-b border-border/70 last:border-0 hover:bg-background">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">
                        {item.case_id}
                      </td>
                      <td className="max-w-[280px] px-3 py-3">
                        <div className="truncate font-medium">{item.title}</div>
                      </td>
                      <td className="px-3 py-3">
                        {item.status ? <Pill tone="primary">{titleCase(item.status)}</Pill> : "—"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.investigator ?? "—"}</td>
                      <td className="px-3 py-3 text-right font-mono text-xs">
                        {formatCount(item.evidence_count)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[11px] text-muted-foreground">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to="/cases/$caseId"
                          params={{ caseId: item.case_id }}
                          onClick={() => setActiveCaseId(item.case_id)}
                          className="text-xs font-medium text-primary"
                        >
                          Open workspace →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Panel>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
      />
    </div>
  );
}
