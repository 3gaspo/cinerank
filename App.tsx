
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Movie, MovieStatus } from './types';
import { auth, db } from './utils/firebase';
import { 
  onAuthStateChanged, 
  User 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  query 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Data Listener
  useEffect(() => {
    if (!user) {
      setMovies([]);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/movies`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movieData = snapshot.docs.map(doc => doc.data() as Movie);
      setMovies(movieData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddMovie = async (partial: Partial<Movie>) => {
    if (!user) return;
    const movieId = crypto.randomUUID();
    const newMovie: Movie = {
      id: movieId,
      name: partial.name || 'Untitled',
      status: MovieStatus.TOWATCH,
      priority: partial.priority || 3,
      fun: partial.fun || 3,
      director: partial.director,
      actors: partial.actors,
      year: partial.year,
      dateAdded: new Date().toISOString(),
      ...partial
    };
    
    await setDoc(doc(db, `users/${user.uid}/movies`, movieId), newMovie);
  };

  const handleUpdateMovie = async (updated: Movie) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/movies`, updated.id), updated);
  };

  const handleDeleteMovie = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/movies`, id));
  };

  const handleMarkWatched = async (id: string, rating: number) => {
    if (!user) return;
    const movieToUpdate = movies.find(m => m.id === id);
    if (movieToUpdate) {
      const updated = {
        ...movieToUpdate,
        status: MovieStatus.WATCHED,
        dateWatched: new Date().toISOString(),
        fun: rating
      };
      await handleUpdateMovie(updated);
    }
  };

  const handleImport = async (imported: Movie[]) => {
    if (!user) return;
    for (const movie of imported) {
      await setDoc(doc(db, `users/${user.uid}/movies`, movie.id), movie);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    for (const movie of movies) {
      await deleteDoc(doc(db, `users/${user.uid}/movies`, movie.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={
            <Home 
              movies={movies} 
              onAddMovie={handleAddMovie} 
              onUpdateMovie={handleUpdateMovie} 
              onDeleteMovie={handleDeleteMovie} 
              onMarkWatched={handleMarkWatched} 
            />
          } />
          <Route path="/history" element={
            <History 
              movies={movies} 
              onUpdateMovie={handleUpdateMovie} 
              onDeleteMovie={handleDeleteMovie} 
            />
          } />
          <Route path="/calendar" element={
            <Calendar 
              movies={movies} 
              onUpdateMovie={handleUpdateMovie} 
              onDeleteMovie={handleDeleteMovie} 
            />
          } />
          <Route path="/stats" element={<Stats movies={movies} />} />
          <Route path="/settings" element={
            <Settings 
              user={user}
              movies={movies} 
              onReset={handleReset} 
              onImport={handleImport} 
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
