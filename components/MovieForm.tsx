
import React, { useState, useEffect } from 'react';
import { Movie, MovieStatus } from '../types';
import { X, Save, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface MovieFormProps {
  initialMovie?: Movie;
  onSubmit: (movie: Partial<Movie>) => void;
  onCancel: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ initialMovie, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Movie>>({
    name: '',
    status: MovieStatus.TOWATCH,
    priority: 3,
    fun: 3,
    director: '',
    actors: '',
    year: undefined,
    dateWatched: undefined,
  });

  useEffect(() => {
    if (initialMovie) {
      setFormData({
        ...initialMovie,
        // Ensure date is in YYYY-MM-DD format for input[type="date"]
        dateWatched: initialMovie.dateWatched ? format(parseISO(initialMovie.dateWatched), 'yyyy-MM-dd') : undefined
      });
    }
  }, [initialMovie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const submission = { ...formData };
    // Convert date string back to ISO
    if (submission.dateWatched) {
      submission.dateWatched = new Date(submission.dateWatched).toISOString();
    }
    
    onSubmit(submission);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {initialMovie ? 'Edit Movie' : 'Add New Movie'}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Movie Title *</label>
          <input
            type="text"
            required
            className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Director</label>
            <input
              type="text"
              className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
            <input
              type="number"
              min="1888"
              max={new Date().getFullYear() + 5}
              className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.year || ''}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || undefined })}
            />
          </div>
        </div>

        {formData.status === MovieStatus.WATCHED && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <CalendarIcon size={14} /> Date Watched
            </label>
            <input
              type="date"
              className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.dateWatched ? formData.dateWatched.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, dateWatched: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actors (comma separated)</label>
          <input
            type="text"
            className="w-full border-gray-300 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.actors}
            onChange={(e) => setFormData({ ...formData, actors: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            />
            <div className="text-center text-sm font-semibold mt-1">{formData.priority}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.status === MovieStatus.WATCHED ? 'Rating (1-5)' : 'Anticipation (1-5)'}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={formData.fun}
              onChange={(e) => setFormData({ ...formData, fun: parseInt(e.target.value) })}
            />
            <div className="text-center text-sm font-semibold mt-1">{formData.fun}</div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
        >
          <Save size={18} />
          <span>{initialMovie ? 'Update Movie' : 'Save Movie'}</span>
        </button>
      </form>
    </div>
  );
};

export default MovieForm;
