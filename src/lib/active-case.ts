import { useSyncExternalStore } from "react";

/**
 * The case the investigator is currently working in. Persisted locally only —
 * it is a UI selection, not backend state.
 */
const KEY = "veritas.active-case";
const listeners = new Set<() => void>();
let value: string | null = null;
let hydrated = false;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    try {
      value = localStorage.getItem(KEY);
    } catch {
      value = null;
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setActiveCaseId(caseId: string | null) {
  value = caseId;
  hydrated = true;
  try {
    if (caseId) localStorage.setItem(KEY, caseId);
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function useActiveCaseId(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => value,
    () => null,
  );
}
