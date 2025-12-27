
import { Movie } from '../types';
import { differenceInDays, parseISO, startOfYear } from 'date-fns';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function calculateMovieScore(movie: Movie): number {
  const now = new Date();
  const dateAdded = parseISO(movie.dateAdded);
  const A = differenceInDays(now, dateAdded); // daysSinceAdded

  let R = 0; // daysSinceRelease
  if (movie.year) {
    const releaseDate = startOfYear(new Date(movie.year, 0, 1));
    R = differenceInDays(now, releaseDate);
  }

  const releaseScore = movie.year ? 1 - clamp01(R / 3650) : 0.5;
  const priorityScore = (movie.priority - 1) / 4;
  const funScore = (movie.fun - 1) / 4;

  const freshAdded = Math.exp(-A / 7);
  const staleAdded = 1 - Math.exp(-A / 60);
  const addedScore = 0.55 * freshAdded + 0.45 * staleAdded;

  const finalScore = 
    0.35 * releaseScore + 
    0.30 * addedScore + 
    0.20 * priorityScore + 
    0.15 * funScore;

  return finalScore;
}
