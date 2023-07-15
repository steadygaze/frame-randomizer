export interface StoredAnswer {
  season: number;
  episode: number;
  seekTime: number;
  expiryTs: number | null;
}

export interface StoredFileState {
  expiryTs: number | null;
}

export interface RegenerationError {
  type: "regen";
  description: string;
  ts: number;
  oldPending: { id: string; startTs: number };
  newPending: { id: string; startTs: number };
}

export interface NoPendingError {
  type: "no_pending";
  description: string;
  ts: number;
  attemptedId: string;
}

export interface PendingMismatchError {
  type: "pending_mismatch";
  description: string;
  ts: number;
  attemptedId: string;
  mismatched: { id: string; startTs: number };
}

export type RunError =
  | RegenerationError
  | NoPendingError
  | PendingMismatchError;

export interface StoredRunData {
  creationTs: number;
  pending: { id: string; startTs: number; assignLatencyMs: number } | null;
  history: {
    id: string;
    startTs: number;
    guessTs: number;
    guess: { season: number; episode: number };
    answer: { season: number; episode: number };
    assignLatencyMs: number;
    seekTimeSec: number;
  }[];
  errors: RunError[];
  expiryTs: number | null;
  version: string;
}
