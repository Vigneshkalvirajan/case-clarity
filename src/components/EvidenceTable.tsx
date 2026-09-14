import type { Evidence } from "@/lib/types";
import { evidenceTypeLabel, formatBytes, formatCount, formatDateTime } from "@/lib/format";
import { ActionButton, HashDisplay, IntegrityPill, ProcessingPill } from "@/components/forensic";

export function EvidenceTable({
  evidence,
  onProcess,
  processingId,
}: {
  evidence: Evidence[];
  onProcess?: (evidenceId: string) => void;
  processingId?: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-border">
            <th className="label-caps px-5 py-2.5 font-medium">Evidence ID</th>
            <th className="label-caps px-3 py-2.5 font-medium">Type</th>
            <th className="label-caps px-3 py-2.5 font-medium">Source file</th>
            <th className="label-caps px-3 py-2.5 font-medium">SHA-256</th>
            <th className="label-caps px-3 py-2.5 font-medium">Processing</th>
            <th className="label-caps px-3 py-2.5 font-medium">Integrity</th>
            <th className="label-caps px-3 py-2.5 text-right font-medium">Records</th>
            <th className="label-caps px-5 py-2.5 text-right font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((item) => (
            <tr key={item.evidence_id} className="border-b border-border/70 last:border-0 hover:bg-background">
              <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">
                {item.evidence_id}
              </td>
              <td className="px-3 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {evidenceTypeLabel(item.evidence_type)}
              </td>
              <td className="max-w-[220px] px-3 py-3">
                <div className="truncate font-medium">{item.file_name ?? "—"}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {formatBytes(item.file_size)}
                </div>
              </td>
              <td className="px-3 py-3">
                <HashDisplay hash={item.sha256} />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <ProcessingPill status={item.processing_status} />
                  {onProcess &&
                  ["uploaded", "failed"].includes((item.processing_status ?? "").toLowerCase()) ? (
                    <ActionButton
                      variant="outline"
                      disabled={processingId === item.evidence_id}
                      onClick={() => onProcess(item.evidence_id)}
                    >
                      {processingId === item.evidence_id ? "Starting…" : "Process"}
                    </ActionButton>
                  ) : null}
                </div>
                {item.error ? (
                  <div className="mt-1 text-[11px] text-destructive">{item.error}</div>
                ) : null}
              </td>
              <td className="px-3 py-3">
                <IntegrityPill status={item.integrity_status} />
              </td>
              <td className="px-3 py-3 text-right font-mono text-xs">
                {formatCount(item.record_count)}
              </td>
              <td className="px-5 py-3 text-right font-mono text-[11px] text-muted-foreground">
                {formatDateTime(item.uploaded_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
