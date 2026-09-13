/**
 * Domain types mirroring the existing forensic backend.
 * These describe what the backend already returns — nothing here changes it.
 */

export type EvidenceType = "cdr" | "whatsapp" | "statement" | string;

export type ProcessingStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "normalized"
  | "indexed"
  | "completed"
  | "failed"
  | string;

export type IntegrityStatus = "verified" | "pending" | "mismatch" | "unknown" | string;

export type ReviewStatus = "pending" | "confirmed" | "dismissed" | string;

export type Severity = "high" | "medium" | "low" | string;

export interface Case {
  case_id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  investigator?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  evidence_count?: number | null;
  contradiction_count?: number | null;
  finding_count?: number | null;
}

export interface Evidence {
  evidence_id: string;
  case_id: string;
  file_name?: string | null;
  evidence_type: EvidenceType;
  sha256?: string | null;
  processing_status: ProcessingStatus;
  integrity_status?: IntegrityStatus | null;
  record_count?: number | null;
  file_size?: number | null;
  uploaded_at?: string | null;
  processed_at?: string | null;
  error?: string | null;
}

export interface EvidenceCitation {
  evidence_id: string;
  record_id?: string | null;
  excerpt?: string | null;
  similarity?: number | null;
  timestamp?: string | null;
  evidence_type?: EvidenceType | null;
}

export interface AnalysisResult {
  query_id?: string | null;
  case_id: string;
  question: string;
  answer: string;
  confidence?: number | null;
  model?: string | null;
  retrieved: EvidenceCitation[];
  created_at?: string | null;
}

export interface Contradiction {
  contradiction_id: string;
  case_id: string;
  statement_claim: string;
  statement_evidence_id?: string | null;
  supporting_evidence: EvidenceCitation[];
  explanation: string;
  severity: Severity;
  confidence?: number | null;
  review_status: ReviewStatus;
  investigator_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  detected_at?: string | null;
}

export interface TimelineEvent {
  event_id: string;
  case_id: string;
  timestamp: string;
  description: string;
  evidence_id: string;
  record_id?: string | null;
  evidence_type?: EvidenceType | null;
  person?: string | null;
}

export interface Finding {
  finding_id: string;
  case_id: string;
  title: string;
  summary?: string | null;
  evidence_ids: string[];
  confidence?: number | null;
  review_status: ReviewStatus;
  investigator_notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
}

export interface ForensicReport {
  report_id: string;
  case_id: string;
  status?: string | null;
  generated_at?: string | null;
  generated_by?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  sections?: string[] | null;
}

export interface AuditEntry {
  audit_id: string;
  case_id?: string | null;
  action: string;
  actor?: string | null;
  target?: string | null;
  details?: string | null;
  timestamp: string;
}
