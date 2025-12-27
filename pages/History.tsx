
import React, { useState, useMemo } from 'react';
import { Movie, MovieStatus } from '../types';
import { format, parseISO, compareDesc, compareAsc, getYear, getMonth } from 'date-fns';
import { Filter, Star, User, Search, ArrowUpDown } from 'lucide-react';
import MovieDetailsDrawer from '../components/MovieDetailsDrawer';
import MovieForm from '../components/MovieForm';

interface HistoryProps {
  movies: Movie[];
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
}

type HistorySort = 'DATE_DESC' | 'DATE_ASC' | 'RATING_DESC' | 'RATING_ASC';

const History: React.FC<HistoryProps> = ({ movies, onUpdateMovie, onDeleteMovie }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<HistorySort>('DATE_DESC');

  const watchedMovies = useMemo(() => {
    let list = movies.filter(m => m.status === MovieStatus.WATCHED);
    
    // Global Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.director?.toLowerCase().includes(q) ||
        m.actors?.toLowerCase().includes(q)
      );
    }

    // Filters
    if (yearFilter !== 'all') {
      list = list.filter(m => m.dateWatched && getYear(parseISO(m.dateWatched)).toString() === yearFilter);
    }
    if (monthFilter !== 'all') {
      list = list.filter(m => m.dateWatched && getMonth(parseISO(m.dateWatched)).toString() === monthFilter);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortOption) {
        case 'DATE_DESC':
          return compareDesc(parseISO(a.dateWatched!), parseISO(b.dateWatched!));
        case 'DATE_ASC':
          return compareAsc(parseISO(a.dateWatched!), parseISO(b.dateWatched!));
        case 'RATING_DESC':
          return b.fun - a.fun;
        case 'RATING_ASC':
          return a.fun - b.fun;
        default:
          return 0;
      }
    });
    
    return list;
  }, [movies, searchQuery, yearFilter, monthFilter, sortOption]);

  const years = useMemo(() => {
    const ySet = new Set<string>();
    movies.forEach(m => {
      if (m.dateWatched) ySet.add(getYear(parseISO(m.dateWatched)).toString());
    });
    return Array.from(ySet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [movies]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Watching History</h2>
          <p className="text-gray-500 font-medium">{watchedMovies.length} movies logged</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <div className="relative">
             <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <select 
               className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value as HistorySort)}
             >
               <option value="DATE_DESC">Newest First</option>
               <option value="DATE_ASC">Oldest First</option>
               <option value="RATING_DESC">Top Rated</option>
               <option value="RATING_ASC">Lowest Rated</option>
             </select>
           </div>
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <select 
               className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
               value={yearFilter}
               onChange={(e) => setYearFilter(e.target.value)}
             >
               <option value="all">All Years</option>
               {years.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-gray-900 outline-none shadow-sm"
        />
      </div>

      {watchedMovies.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
           <p className="text-gray-400 font-medium">No watched movies yet matching your filters.</p>
         </div>
      ) : (
        <div className="space-y-4">
          {watchedMovies.map((movie) => (
            <div 
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <Star size={20} className="fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{movie.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {movie.director && (
                      <div className="flex items-center text-xs text-gray-500">
                        <User size={12} className="mr-1" /> {movie.director}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">
                      Watched: {format(parseISO(movie.dateWatched!), 'PP')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                 <div className="flex space-x-0.5 mb-1">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={10} className={i < movie.fun ? "fill-rose-400 text-rose-400" : "text-gray-200"} />
                   ))}
                 </div>
                 <span className="text-[10px] uppercase font-black text-indigo-400 tracking-tighter">Rating: {movie.fun}/5</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMovie && !isEditing && (
        <MovieDetailsDrawer 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onDelete={(id) => { onDeleteMovie(id); setSelectedMovie(null); }}
          onEdit={() => setIsEditing(true)}
          onMarkWatched={() => {}}
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
    </div>
  );
};

export default History;
