
import { Movie } from '../types';

const STORAGE_KEY = 'cinerank_movies';

export const storage = {
  getMovies: (): Movie[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMovies: (movies: Movie[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  },
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
