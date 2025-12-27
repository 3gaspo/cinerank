
export enum MovieStatus {
  TOWATCH = 'towatch',
  WATCHED = 'watched'
}

export interface Movie {
  id: string;
  name: string;
  status: MovieStatus;
  priority: number; // 1-5
  fun: number; // 1-5
  director?: string;
  actors?: string; // comma-separated
  year?: number;
  dateAdded: string; // ISO string
  dateWatched?: string; // ISO string
}

export type SortOption = 'RANKED' | 'RECENTLY_ADDED' | 'HIGHEST_PRIORITY';
