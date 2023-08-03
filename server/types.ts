export interface StoredAnswer {
  season: number;
  episode: number;
  seekTime: number;
  expiryTs: number | null;
}

export interface PendingRunState {
  id: string;
  assignTs: number;
  startTs?: number;
  assignLatencyMs: number;
}

export interface StoredFileState {
  genSeries: string;
  expiryTs: number | null;
}

export interface RegenerationError {
  type: "regen";
  description: string;
  ts: number;
  oldPending: PendingRunState;
  newPending: PendingRunState;
}

export interface NoPendingError {
  type: "no_pending";
  description: string;
  ts: number;
  attemptedId: string;
}

export interface NoPendingOnLoadError {
  type: "no_pending_on_load";
  description: string;
  ts: number;
  attemptedId: string;
}

export interface PendingMismatchError {
  type: "pending_mismatch";
  description: string;
  ts: number;
  attemptedId: string;
  mismatched: PendingRunState;
}

export interface PendingMismatchOnLoadError {
  type: "pending_mismatch_on_load";
  description: string;
  ts: number;
  attemptedId: string;
  mismatched: PendingRunState;
}

export interface CheckUnloadedError {
  type: "check_unloaded";
  description: string;
  ts: number;
  attemptedId: string;
}

export type RunError =
  | RegenerationError
  | NoPendingError
  | NoPendingOnLoadError
  | PendingMismatchError
  | PendingMismatchOnLoadError
  | CheckUnloadedError;

export interface StoredRunData {
  creationTs: number;
  pending: PendingRunState | null;
  history: {
    id: string;
    assignTs: number;
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
