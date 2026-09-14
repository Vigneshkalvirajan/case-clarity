import { useMemo, useState } from "react";
import type { TimelineEvent } from "@/lib/types";
import { evidenceTypeLabel, formatDate, formatTime } from "@/lib/format";
import { EmptyState, EvidenceChip, Label } from "@/components/forensic";

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  const [type, setType] = useState<string>("all");
  const [person, setPerson] = useState<string>("all");
  const [evidenceId, setEvidenceId] = useState<string>("all");

  const types = useMemo(
    () => Array.from(new Set(events.map((e) => (e.evidence_type ?? "").toLowerCase()).filter(Boolean))),
    [events],
  );
  const people = useMemo(
    () => Array.from(new Set(events.map((e) => e.person).filter(Boolean))) as string[],
    [events],
  );
  const evidenceIds = useMemo(
    () => Array.from(new Set(events.map((e) => e.evidence_id).filter(Boolean))),
    [events],
  );

  const filtered = events
    .filter((e) => type === "all" || (e.evidence_type ?? "").toLowerCase() === type)
    .filter((e) => person === "all" || e.person === person)
    .filter((e) => evidenceId === "all" || e.evidence_id === evidenceId)
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-3">
        <Filter label="Evidence type" value={type} onChange={setType} options={types} render={evidenceTypeLabel} />
        {people.length ? (
          <Filter label="Person" value={person} onChange={setPerson} options={people} />
        ) : null}
        <Filter label="Evidence ID" value={evidenceId} onChange={setEvidenceId} options={evidenceIds} />
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {filtered.length} of {events.length} events
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No events match these filters"
          description="Adjust the filters above to see timeline events reconstructed from the case evidence."
        />
      ) : (
        <ol className="p-6">
          {filtered.map((event, index) => (
            <li key={event.event_id ?? `${event.evidence_id}-${index}`} className="relative pb-6 pl-6 last:pb-0">
              <span className="absolute top-1.5 left-0 size-2.5 rounded-full bg-primary" />
              {index < filtered.length - 1 ? (
                <span className="absolute top-4 bottom-0 left-[5px] w-px bg-border" />
              ) : null}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDate(event.timestamp)} · {formatTime(event.timestamp)}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {evidenceTypeLabel(event.evidence_type)}
                </span>
                {event.person ? <span className="text-[11px] text-muted-foreground">{event.person}</span> : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed">{event.description}</p>
              <div className="mt-2">
                <EvidenceChip evidenceId={event.evidence_id} recordId={event.record_id} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  render?: (value: string) => string;
}) {
  return (
    <label className="flex items-center gap-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-2 py-1 font-mono text-[11px] outline-none focus:border-primary/50"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {render ? render(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}
