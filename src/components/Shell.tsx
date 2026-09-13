import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { setActiveCaseId, useActiveCaseId } from "@/lib/active-case";
import { titleCase } from "@/lib/format";
import { Pill } from "@/components/forensic";

const NAV: { to: string; label: string; group: string }[] = [
  { to: "/", label: "Dashboard", group: "Overview" },
  { to: "/cases", label: "Cases", group: "Overview" },
  { to: "/evidence", label: "Evidence", group: "Investigation" },
  { to: "/analysis", label: "Investigation Analysis", group: "Investigation" },
  { to: "/contradictions", label: "Contradictions", group: "Investigation" },
  { to: "/timeline", label: "Timeline", group: "Investigation" },
  { to: "/findings", label: "Findings", group: "Record" },
  { to: "/reports", label: "Reports", group: "Record" },
  { to: "/audit", label: "Audit Trail", group: "Record" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeCaseId = useActiveCaseId();

  const groups = ["Overview", "Investigation", "Record"];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border bg-panel md:flex">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
          <div className="grid size-8 place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
            V
          </div>
          <div>
            <div className="font-display text-[15px] leading-none font-semibold">Veritas</div>
            <div className="label-caps mt-1">Forensics</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map((group) => (
            <div key={group} className="mb-3">
              <div className="label-caps px-3 pb-1.5">{group}</div>
              {NAV.filter((item) => item.group === group).map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                      active
                        ? "bg-primary font-medium text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${active ? "bg-accent" : "bg-border"}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          {activeCaseId ? (
            <Link
              to="/cases/$caseId"
              params={{ caseId: activeCaseId }}
              className="block rounded-lg border border-border bg-background p-3 hover:border-primary/40"
            >
              <div className="label-caps">Case workspace</div>
              <div className="mt-1 font-mono text-xs font-medium text-primary">{activeCaseId}</div>
            </Link>
          ) : (
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="label-caps">No case selected</div>
              <Link to="/cases" className="mt-1 block text-xs font-medium text-primary">
                Choose a case →
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <CaseContextBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function CaseContextBar() {
  const activeCaseId = useActiveCaseId();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", activeCaseId],
    queryFn: () => api.getCase(activeCaseId as string),
    enabled: Boolean(activeCaseId),
  });

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-panel/95 px-6 py-3 backdrop-blur">
      <span className="label-caps">Active case</span>
      {activeCaseId ? (
        <>
          <Link
            to="/cases/$caseId"
            params={{ caseId: activeCaseId }}
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {activeCaseId}
          </Link>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {isLoading ? "loading case…" : isError ? "case details unavailable" : (data?.title ?? "—")}
          </span>
          {data?.status ? <Pill tone="accent" dot>{titleCase(data.status)}</Pill> : null}
          {data?.investigator ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              Lead · {data.investigator}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setActiveCaseId(null)}
            className="ml-auto font-mono text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </>
      ) : (
        <>
          <span className="text-xs text-muted-foreground">
            No case selected — investigation areas need a case.
          </span>
          <Link to="/cases" className="ml-auto text-xs font-medium text-primary">
            Select a case →
          </Link>
        </>
      )}
    </header>
  );
}
