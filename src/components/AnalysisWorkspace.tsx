import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { evidenceTypeLabel, formatDateTime } from "@/lib/format";
import {
  ActionButton,
  AiBlock,
  ConfidenceMeter,
  EmptyState,
  ErrorState,
  EvidenceChip,
  Label,
  LoadingState,
  Panel,
} from "@/components/forensic";

/**
 * Evidence query workspace — an investigation question in, a grounded,
 * cited analysis out. Deliberately not a chat transcript.
 */
export function AnalysisWorkspace({ caseId }: { caseId: string }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const history = useQuery({
    queryKey: ["analyses", caseId],
    queryFn: () => api.listAnalyses(caseId),
    retry: false,
  });

  const run = useMutation({
    mutationFn: (q: string) => api.runAnalysis(caseId, q),
    onSuccess: (data) => {
      setResult(data);
      void history.refetch();
    },
  });

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Panel title="Investigation question" meta="retrieval-augmented · evidence-grounded">
          <form
            className="space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) run.mutate(question.trim());
            }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="e.g. Which CDR records show contact between the two devices between 21:00 and 23:00?"
              className="w-full resize-none rounded-lg border border-input bg-background px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-primary/50"
            />
            <div className="flex items-center gap-3">
              <ActionButton type="submit" disabled={run.isPending || !question.trim()}>
                {run.isPending ? "Retrieving evidence…" : "Run analysis"}
              </ActionButton>
              <span className="font-mono text-[11px] text-muted-foreground">
                Answers cite Evidence IDs and Record IDs from this case only.
              </span>
            </div>
          </form>
        </Panel>

        {run.isPending ? (
          <Panel>
            <LoadingState label="Embedding question · searching indexed evidence · generating analysis…" />
          </Panel>
        ) : null}

        {run.isError ? (
          <Panel>
            <ErrorState error={run.error} onRetry={() => run.mutate(question)} />
          </Panel>
        ) : null}

        {result ? <AnalysisResultView result={result} /> : null}

        {!result && !run.isPending && !run.isError ? (
          <Panel>
            <EmptyState
              title="No analysis run yet"
              description="Ask an investigation question above. The system retrieves matching evidence records and returns an analysis with supporting Evidence IDs and a confidence score."
            />
          </Panel>
        ) : null}
      </div>

      <Panel title="Previous queries" meta={history.data ? `${history.data.length}` : undefined}>
        {history.isLoading ? <LoadingState /> : null}
        {history.isError ? <ErrorState error={history.error} onRetry={() => void history.refetch()} /> : null}
        {history.data?.length === 0 ? (
          <EmptyState title="No earlier queries" description="Queries recorded by the backend appear here." />
        ) : null}
        {history.data?.length ? (
          <ul className="divide-y divide-border">
            {history.data.map((item, i) => (
              <li key={item.query_id ?? i}>
                <button
                  type="button"
                  onClick={() => setResult(item)}
                  className="block w-full px-5 py-3 text-left hover:bg-background"
                >
                  <p className="line-clamp-2 text-xs leading-relaxed">{item.question}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </div>
  );
}

function AnalysisResultView({ result }: { result: AnalysisResult }) {
  return (
    <Panel title="Analysis result" meta={result.model ? `model · ${result.model}` : undefined}>
      <div className="space-y-4 p-5">
        <div className="rounded-lg border border-border bg-background p-3.5">
          <Label>Question</Label>
          <p className="mt-1.5 text-sm leading-relaxed">{result.question}</p>
        </div>

        <AiBlock>
          <p className="text-sm leading-relaxed whitespace-pre-line">{result.answer}</p>
          <div className="mt-4 max-w-xs">
            <ConfidenceMeter confidence={result.confidence} tone="ai" />
          </div>
        </AiBlock>

        <div>
          <Label>Supporting evidence</Label>
          {result.retrieved?.length ? (
            <ul className="mt-2 space-y-2">
              {result.retrieved.map((cite, i) => (
                <li
                  key={`${cite.evidence_id}-${cite.record_id ?? i}`}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <EvidenceChip evidenceId={cite.evidence_id} recordId={cite.record_id} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {evidenceTypeLabel(cite.evidence_type)}
                    </span>
                    {cite.timestamp ? (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatDateTime(cite.timestamp)}
                      </span>
                    ) : null}
                    {cite.similarity != null ? (
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                        similarity {cite.similarity.toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                  {cite.excerpt ? (
                    <p className="mt-2 text-xs leading-relaxed text-foreground">{cite.excerpt}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              The backend returned no retrieved records for this answer.
            </p>
          )}
        </div>

        <p className="border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
          System output for investigative assistance. It does not establish guilt — record your own
          conclusion under Findings.
        </p>
      </div>
    </Panel>
  );
}
