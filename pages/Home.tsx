
import React, { useState, useMemo } from 'react';
import { Movie, MovieStatus, SortOption } from '../types';
import { calculateMovieScore } from '../utils/ranking';
import { Plus, ListFilter, Star, Clock, Layers, Search, CheckCircle2 } from 'lucide-react';
import MovieForm from '../components/MovieForm';
import MovieDetailsDrawer from '../components/MovieDetailsDrawer';
import { parseISO, compareDesc } from 'date-fns';

interface HomeProps {
  movies: Movie[];
  onAddMovie: (movie: Partial<Movie>) => void;
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
  onMarkWatched: (id: string, rating: number) => void;
}

const Home: React.FC<HomeProps> = ({ 
  movies, 
  onAddMovie, 
  onUpdateMovie, 
  onDeleteMovie, 
  onMarkWatched 
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('RANKED');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rating Prompt State
  const [ratingPromptMovieId, setRatingPromptMovieId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState(3);

  const filteredMovies = useMemo(() => {
    let list = movies.filter(m => m.status === MovieStatus.TOWATCH);

    // Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.director?.toLowerCase().includes(q) ||
        m.actors?.toLowerCase().includes(q)
      );
    }

    // Apply Sort
    if (sortOption === 'RANKED') {
      list.sort((a, b) => {
        const scoreA = calculateMovieScore(a);
        const scoreB = calculateMovieScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return compareDesc(parseISO(a.dateAdded), parseISO(b.dateAdded));
      });
    } else if (sortOption === 'RECENTLY_ADDED') {
      list.sort((a, b) => compareDesc(parseISO(a.dateAdded), parseISO(b.dateAdded)));
    } else if (sortOption === 'HIGHEST_PRIORITY') {
      list.sort((a, b) => b.priority - a.priority);
    }

    return list;
  }, [movies, sortOption, searchQuery]);

  const triggerMarkWatched = (id: string) => {
    setRatingPromptMovieId(id);
    setTempRating(3);
    setSelectedMovie(null);
  };

  const confirmMarkWatched = () => {
    if (ratingPromptMovieId) {
      onMarkWatched(ratingPromptMovieId, tempRating);
      setRatingPromptMovieId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Queue</h2>
          <p className="text-gray-500 font-medium">{filteredMovies.length} movies to watch</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-600 text-white p-3 md:px-6 md:py-3 rounded-2xl md:rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span className="hidden md:inline font-bold">Add Movie</span>
        </button>
      </div>

      {/* Local Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search movies, directors, actors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-gray-900 outline-none shadow-sm"
        />
      </div>

      {/* Sorting Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'RANKED', label: 'Ranked', icon: Layers },
          { id: 'RECENTLY_ADDED', label: 'Recent', icon: Clock },
          { id: 'HIGHEST_PRIORITY', label: 'Priority', icon: Star },
        ].map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setSortOption(opt.id as SortOption)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                sortOption === opt.id 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Movie List */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
            <ListFilter size={48} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No movies found</h3>
          <p className="text-gray-500">Try adjusting your search or add a new movie to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredMovies.map((movie, index) => (
            <div 
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <span className="text-xs font-black text-indigo-400 w-6">#{index + 1}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{movie.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {movie.year && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">{movie.year}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg">
             <MovieForm onSubmit={(m) => { onAddMovie(m); setIsAddOpen(false); }} onCancel={() => setIsAddOpen(false)} />
          </div>
        </div>
      )}

      {selectedMovie && !isEditing && (
        <MovieDetailsDrawer 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onDelete={(id) => { onDeleteMovie(id); setSelectedMovie(null); }}
          onEdit={() => setIsEditing(true)}
          onMarkWatched={(id) => triggerMarkWatched(id)}
        />
      )}

      {isEditing && selectedMovie && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-lg">
             <MovieForm 
               initialMovie={selectedMovie} 
               onSubmit={(m) => { onUpdateMovie(m as Movie); setIsEditing(false); setSelectedMovie(null); }} 
               onCancel={() => setIsEditing(false)} 
             />
          </div>
        </div>
      )}

      {/* Rating Prompt Modal */}
      {ratingPromptMovieId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRatingPromptMovieId(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in duration-200">
            <div className="text-center">
               <div className="inline-block p-4 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                 <CheckCircle2 size={32} />
               </div>
               <h3 className="text-2xl font-bold text-gray-900">How was it?</h3>
               <p className="text-gray-500 mt-2">Rate this movie out of 5 stars.</p>
            </div>
            
            <div className="flex justify-center space-x-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setTempRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={36} 
                    className={star <= tempRating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                  />
                </button>
              ))}
            </div>

            <button 
              onClick={confirmMarkWatched}
              className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-white transition-all shadow-lg shadow-indigo-200 hover:bg-indigo-700"
            >
              SAVE RATING
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
