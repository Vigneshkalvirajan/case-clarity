import { useState } from "react";
import type { Contradiction, ReviewStatus } from "@/lib/types";
import { formatDateTime, toPercent } from "@/lib/format";
import {
  ActionButton,
  AiBlock,
  EvidenceChip,
  InvestigatorBlock,
  Label,
  ReviewPill,
  SeverityPill,
} from "@/components/forensic";

export function ContradictionCard({
  contradiction,
  onReview,
  isSubmitting,
}: {
  contradiction: Contradiction;
  onReview?: (status: ReviewStatus, notes: string) => void;
  isSubmitting?: boolean;
}) {
  const [notes, setNotes] = useState(contradiction.investigator_notes ?? "");
  const pct = toPercent(contradiction.confidence);
  const decided = (contradiction.review_status ?? "pending").toLowerCase() !== "pending";

  return (
    <article className="rounded-xl border border-border bg-panel">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
        <span className="font-mono text-xs font-semibold text-primary">
          {contradiction.contradiction_id}
        </span>
        <SeverityPill severity={contradiction.severity} />
        <ReviewPill status={contradiction.review_status} />
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          detected {formatDateTime(contradiction.detected_at)}
        </span>
      </header>

      <div className="grid gap-4 border-b border-border p-5 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3.5">
          <Label>Statement claim</Label>
          <p className="mt-1.5 text-sm leading-relaxed">{contradiction.statement_claim}</p>
          {contradiction.statement_evidence_id ? (
            <div className="mt-2.5">
              <EvidenceChip evidenceId={contradiction.statement_evidence_id} />
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-border bg-background p-3.5">
          <Label>Supporting evidence</Label>
          {contradiction.supporting_evidence?.length ? (
            <ul className="mt-1.5 space-y-2">
              {contradiction.supporting_evidence.map((cite, i) => (
                <li key={`${cite.evidence_id}-${cite.record_id ?? i}`} className="text-sm leading-relaxed">
                  {cite.excerpt ? <p className="text-foreground">{cite.excerpt}</p> : null}
                  <div className="mt-1.5">
                    <EvidenceChip evidenceId={cite.evidence_id} recordId={cite.record_id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              No supporting records returned for this contradiction.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <AiBlock>
          <p className="text-sm leading-relaxed">{contradiction.explanation}</p>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            System confidence: {pct == null ? "not reported" : `${pct}%`} · an inconsistency
            observed in the evidence, not a determination of guilt.
          </p>
        </AiBlock>

        <InvestigatorBlock>
          {decided ? (
            <div className="space-y-2">
              <p className="text-sm">
                Marked <span className="font-semibold">{contradiction.review_status}</span>
                {contradiction.reviewed_by ? ` by ${contradiction.reviewed_by}` : ""}
                {contradiction.reviewed_at ? ` · ${formatDateTime(contradiction.reviewed_at)}` : ""}
              </p>
              {contradiction.investigator_notes ? (
                <p className="rounded-md border border-border bg-background p-2.5 text-xs leading-relaxed">
                  {contradiction.investigator_notes}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Investigator notes (recorded with your decision)"
                rows={2}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <ActionButton
                  disabled={isSubmitting || !onReview}
                  onClick={() => onReview?.("confirmed", notes)}
                >
                  Confirm contradiction
                </ActionButton>
                <ActionButton
                  variant="outline"
                  disabled={isSubmitting || !onReview}
                  onClick={() => onReview?.("dismissed", notes)}
                >
                  Dismiss
                </ActionButton>
              </div>
            </div>
          )}
        </InvestigatorBlock>
      </div>
    </article>
  );
}
