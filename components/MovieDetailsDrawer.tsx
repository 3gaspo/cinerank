
import React from 'react';
import { Movie, MovieStatus } from '../types';
import { Calendar, User, Star, Trash2, CheckCircle2, Edit3, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface MovieDetailsDrawerProps {
  movie: Movie;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
  onMarkWatched: (id: string) => void;
}

const MovieDetailsDrawer: React.FC<MovieDetailsDrawerProps> = ({ 
  movie, 
  onClose, 
  onDelete, 
  onEdit, 
  onMarkWatched 
}) => {
  const isWatched = movie.status === MovieStatus.WATCHED;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header - Fixed at top */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{movie.name}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 text-gray-500 hover:text-gray-900"
            aria-label="Close Details"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Metadata Cards - Conditional Display */}
          <div className="grid grid-cols-2 gap-4">
             {isWatched ? (
               <div className="col-span-2 bg-amber-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-amber-600 uppercase font-bold tracking-widest mb-2">Movie Rating</span>
                  <div className="flex space-x-1">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} size={24} className={i < movie.fun ? "fill-amber-400 text-amber-400" : "text-amber-200"} />
                     ))}
                  </div>
               </div>
             ) : (
               <>
                 <div className="bg-indigo-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-indigo-500 uppercase font-bold tracking-widest mb-1">Priority</span>
                    <div className="flex space-x-0.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={14} className={i < movie.priority ? "fill-indigo-500 text-indigo-500" : "text-indigo-200"} />
                       ))}
                    </div>
                 </div>
                 <div className="bg-rose-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-rose-500 uppercase font-bold tracking-widest mb-1">Anticipation</span>
                    <div className="flex space-x-0.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={14} className={i < movie.fun ? "fill-rose-500 text-rose-500" : "text-rose-200"} />
                       ))}
                    </div>
                 </div>
               </>
             )}
          </div>

          <div className="space-y-4">
            {movie.year && (
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="text-gray-400" size={20} />
                <span className="font-medium">Released in {movie.year}</span>
              </div>
            )}
            {movie.director && (
              <div className="flex items-center space-x-3 text-gray-700">
                <User className="text-gray-400" size={20} />
                <span className="font-medium">Directed by {movie.director}</span>
              </div>
            )}
            {movie.actors && (
              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Starring</span>
                <div className="flex flex-wrap gap-2">
                  {movie.actors.split(',').map((actor, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 font-medium">
                      {actor.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-3">
             <p className="text-xs text-gray-400 italic">
               Added on {format(parseISO(movie.dateAdded), 'PPP p')}
             </p>
             {movie.dateWatched && (
               <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                 <CheckCircle2 size={12} /> Watched on {format(parseISO(movie.dateWatched), 'PPP p')}
               </p>
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white space-y-3 flex-shrink-0 pb-safe mb-safe">
          <div className="flex gap-3">
            <button 
              onClick={() => onEdit(movie)}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 size={18} /> Edit
            </button>
            <button 
              onClick={() => {
                if(confirm("Delete this movie?")) onDelete(movie.id);
              }}
              className="flex-1 bg-white border border-rose-100 text-rose-600 font-semibold py-3 rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
          {movie.status === MovieStatus.TOWATCH && (
            <button 
              onClick={() => onMarkWatched(movie.id)}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <CheckCircle2 size={20} /> Mark as Watched
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsDrawer;
