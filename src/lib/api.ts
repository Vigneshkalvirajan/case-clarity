import type {
  AnalysisResult,
  AuditEntry,
  Case,
  Contradiction,
  Evidence,
  Finding,
  ForensicReport,
  ReviewStatus,
  TimelineEvent,
} from "./types";

/**
 * Thin client over the EXISTING forensic backend REST API.
 * Base URL is configurable so the frontend can point at the running backend
 * without any backend change: set VITE_API_BASE_URL (default "/api").
 */
export const API_BASE: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  const isFormData = init?.body instanceof FormData;
  const headers: HeadersInit = isFormData
    ? ((init?.headers ?? {}) as HeadersInit)
    : { "Content-Type": "application/json", ...((init?.headers ?? {}) as Record<string, string>) };
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Cannot reach the investigation backend.", 0);
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      detail = body.detail ?? body.message ?? detail;
    } catch {
      /* keep default */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Backends commonly wrap collections as {items|results|data: []}. */
function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    for (const key of ["items", "results", "data", "records"]) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

export const api = {
  // Cases
  listCases: () => request<unknown>("/cases").then(asList<Case>),
  getCase: (caseId: string) => request<Case>(`/cases/${caseId}`),
  createCase: (input: { title: string; description?: string; investigator?: string }) =>
    request<Case>("/cases", { method: "POST", body: JSON.stringify(input) }),

  // Evidence
  listEvidence: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/evidence`).then(asList<Evidence>),
  uploadEvidence: (caseId: string, file: File, evidenceType: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("evidence_type", evidenceType);
    return request<Evidence>(`/cases/${caseId}/evidence`, { method: "POST", body: form });
  },
  processEvidence: (evidenceId: string) =>
    request<Evidence>(`/evidence/${evidenceId}/process`, { method: "POST" }),

  // Investigation analysis (RAG)
  runAnalysis: (caseId: string, question: string) =>
    request<AnalysisResult>(`/cases/${caseId}/analysis`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  listAnalyses: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/analysis`).then(asList<AnalysisResult>),

  // Contradictions
  listContradictions: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/contradictions`).then(asList<Contradiction>),
  detectContradictions: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/contradictions/detect`, { method: "POST" }).then(
      asList<Contradiction>,
    ),
  reviewContradiction: (
    contradictionId: string,
    input: { review_status: ReviewStatus; investigator_notes?: string },
  ) =>
    request<Contradiction>(`/contradictions/${contradictionId}/review`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  // Timeline
  listTimeline: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/timeline`).then(asList<TimelineEvent>),

  // Findings
  listFindings: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/findings`).then(asList<Finding>),
  createFinding: (
    caseId: string,
    input: {
      title: string;
      summary?: string;
      evidence_ids: string[];
      confidence?: number;
      investigator_notes?: string;
    },
  ) => request<Finding>(`/cases/${caseId}/findings`, { method: "POST", body: JSON.stringify(input) }),

  // Reports
  listReports: (caseId: string) =>
    request<unknown>(`/cases/${caseId}/reports`).then(asList<ForensicReport>),
  generateReport: (caseId: string) =>
    request<ForensicReport>(`/cases/${caseId}/reports`, { method: "POST" }),

  // Audit trail (read-only)
  listAudit: (caseId?: string) =>
    request<unknown>(caseId ? `/cases/${caseId}/audit` : "/audit").then(asList<AuditEntry>),
};
