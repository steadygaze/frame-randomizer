export interface StoredAnswer {
  season: number;
  episode: number;
  seekTime: number;
  expiryTs: number | null;
}

export interface StoredFileState {
  expiryTs: number | null;
}
