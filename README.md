# Case Clarity

Design and build the frontend UI/UX for my existing project:

AI-Assisted Digital Forensic Investigation and Evidence Analysis System

Understand the backend functionality below and design the frontend around the actual investigation workflow. Do not change the backend architecture, APIs, database, or business logic.

Core Purpose

The application helps investigators analyze digital evidence during crime investigations. It must assist investigators, not automatically determine guilt or innocence.

Evidence Types

The backend supports:

CDR files

WhatsApp exported chats

Suspect/witness statements

Evidence is uploaded to a case, processed, normalized, and stored. Each evidence file has an Evidence ID, SHA-256 hash, processing status, integrity status, and extracted records.

Investigation Workflow

Create Case → Upload Evidence → Process Evidence → Normalize → Index → Search/Analyze → Correlate Evidence → Detect Contradictions → Build Timeline → Investigator Review → Findings → Forensic Report → Audit Trail

AI / RAG Analysis

The backend uses:

Sentence Transformers (all-MiniLM-L6-v2)

ChromaDB

Cosine similarity

RAG

Qwen through Ollama

Gemini as an alternative LLM

Investigators can enter investigation questions. The system retrieves relevant evidence and generates an evidence-grounded analysis with confidence and supporting Evidence IDs/Record IDs.

Important: Do not design this as a ChatGPT-style chatbot. Make it an Investigation Analysis / Evidence Query workspace with clear evidence references.

Contradiction Detection

The system compares statements with CDR and WhatsApp evidence to detect potential inconsistencies.

Each contradiction contains:

Contradiction ID

Statement claim

Supporting evidence

Explanation

Severity

Confidence

Review status

Review states:

Pending Review

Confirmed

Dismissed

Clearly distinguish AI/System Analysis from Investigator Decision.

Timeline

The backend creates a chronological timeline from CDR, WhatsApp, and statement records.

Timeline events should be traceable back to their source evidence and support filtering by time, person, evidence type, and Evidence ID.

Findings

Investigators can review AI-generated results and create findings with evidence references, confidence, review status, and investigator notes.

Reports

The backend generates forensic PDF reports containing case information, evidence inventory, SHA-256 hashes, processing information, timeline, contradiction analysis, findings, investigator review, and audit information.

Audit Trail

The backend records important actions such as case creation, evidence upload/processing, AI queries, contradiction detection, and report generation. The audit trail is read-only.

Main Frontend Areas

Create an intuitive investigation application containing appropriate areas for:

Dashboard

Cases

Evidence

Investigation Analysis

Contradictions

Timeline

Findings

Reports

Audit Trail

A Case Workspace should act as the central place for investigating a specific case.

Critical UX Requirements

Evidence traceability must be central.

AI results must show supporting evidence.

Clearly distinguish AI analysis from investigator decisions.

Show Evidence IDs, Case IDs, timestamps, confidence, severity, integrity, and review status where relevant.

Do not show fake cases, evidence, contradictions, findings, or timeline data when the backend is empty.

Provide proper loading, processing, success, and error states.

Do not invent unrelated functionality.

Do not redesign this as a generic admin dashboard.

Do not change existing backend functionality.

You decide the complete visual design, colors, typography, layout, navigation, components, cards, tables, icons, and visualizations based on what is most appropriate for a professional digital forensic investigation platform.

Prioritize usability, investigation workflow, evidence traceability, AI transparency, contradiction review, timeline understanding, reporting, and auditability.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3e0d05b2-9516-4f1c-ba91-77defeba83b7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
