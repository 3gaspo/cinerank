
import React, { useState, useMemo } from 'react';
import { Movie, MovieStatus } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
// Fixed: Added missing X import from lucide-react
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import MovieDetailsDrawer from '../components/MovieDetailsDrawer';
import MovieForm from '../components/MovieForm';

interface CalendarProps {
  movies: Movie[];
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ movies, onUpdateMovie, onDeleteMovie }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const watchedMovies = useMemo(() => 
    movies.filter(m => m.status === MovieStatus.WATCHED && m.dateWatched), 
    [movies]
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const getMoviesForDay = (day: Date) => {
    return watchedMovies.filter(m => isSameDay(parseISO(m.dateWatched!), day));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Watch Calendar</h2>
          <p className="text-gray-500 font-medium">Track your movie habit over time</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-bold text-gray-700 w-36 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const moviesForDay = getMoviesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDay(day)}
                className={`min-h-[80px] md:min-h-[100px] p-2 border-r border-b border-gray-50 cursor-pointer hover:bg-indigo-50/30 transition-colors flex flex-col items-center justify-center ${
                  !isCurrentMonth ? 'bg-gray-50/40 text-gray-300' : 'text-gray-700'
                }`}
              >
                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  isToday ? 'bg-indigo-600 text-white' : ''
                }`}>
                  {format(day, 'd')}
                </span>
                {moviesForDay.length > 0 && (
                  <div className="flex items-center justify-center">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {moviesForDay.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day View */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{format(selectedDay, 'PPPP')}</h3>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-gray-100 rounded-full">
                 <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {getMoviesForDay(selectedDay).length === 0 ? (
                <p className="text-center py-10 text-gray-400">No movies watched on this day.</p>
              ) : (
                getMoviesForDay(selectedDay).map(movie => (
                  <div 
                    key={movie.id}
                    onClick={() => { setSelectedMovie(movie); setSelectedDay(null); }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-gray-800">{movie.name}</span>
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                  </div>
                ))
              )}
            </div>
          </div>
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

export default Calendar;
