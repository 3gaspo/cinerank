
import React, { useState } from 'react';
import { Download, Trash2, RotateCcw, Upload, LogOut, ShieldCheck } from 'lucide-react';
import { Movie } from '../types';
import { auth } from '../utils/firebase';
import { signOut, User } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

interface SettingsProps {
  user: User;
  movies: Movie[];
  onReset: () => void;
  onImport: (movies: Movie[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, movies, onReset, onImport }) => {
  const [resetConfirm, setResetConfirm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogout = () => {
    if(confirm("Are you sure you want to sign out?")) {
      signOut(auth);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Status', 'Priority', 'Fun', 'Director', 'Actors', 'Year', 'DateAdded', 'DateWatched'];
    const rows = movies.map(m => [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      m.status,
      m.priority,
      m.fun,
      `"${(m.director || '').replace(/"/g, '""')}"`,
      `"${(m.actors || '').replace(/"/g, '""')}"`,
      m.year || '',
      m.dateAdded,
      m.dateWatched || ''
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cinerank_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const imported: Movie[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (cols && cols.length >= 10) {
          const clean = (val: string) => val.replace(/^"|"$/g, '').replace(/""/g, '"');
          imported.push({
            id: clean(cols[0]),
            name: clean(cols[1]),
            status: clean(cols[2]) as any,
            priority: parseInt(clean(cols[3])),
            fun: parseInt(clean(cols[4])),
            director: clean(cols[5]),
            actors: clean(cols[6]),
            year: parseInt(clean(cols[7])) || undefined,
            dateAdded: clean(cols[8]),
            dateWatched: clean(cols[9]) || undefined
          });
        }
      }
      if (imported.length > 0) {
        if (confirm(`Import ${imported.length} movies? This will push all items to the cloud.`)) {
          onImport(imported);
        }
      } else {
        alert("Could not parse CSV. Make sure it was exported from CineRank.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
        <p className="text-gray-500 font-medium">Manage your account and data</p>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
           <div>
              <h3 className="font-bold text-gray-800">Account</h3>
              <p className="text-sm text-gray-500">Currently signed in as</p>
           </div>
           <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-black">
              <ShieldCheck size={14} /> Cloud Sync Active
           </div>
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                 {user.email?.[0].toUpperCase()}
              </div>
              <div>
                 <p className="font-bold text-gray-900">{user.email}</p>
                 <p className="text-xs text-gray-400">Personal Collection</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
           >
             <LogOut size={18} /> Sign Out
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-gray-800">Data Management</h3>
           <p className="text-sm text-gray-500">Backup or restore your local database</p>
        </div>
        
        <div className="divide-y divide-gray-50">
           <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-bold text-gray-700">Export Library</h4>
                <p className="text-xs text-gray-400">Download your entire collection as a CSV file</p>
              </div>
              <button 
                onClick={exportCSV}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors"
              >
                <Download size={18} /> Export
              </button>
           </div>

           <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-bold text-gray-700">Import Library</h4>
                <p className="text-xs text-gray-400">Upload a CineRank CSV backup</p>
              </div>
              <label className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors cursor-pointer">
                <Upload size={18} /> Import
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
           </div>

           <div className="p-6 flex items-center justify-between hover:bg-rose-50/30 transition-colors">
              <div>
                <h4 className="font-bold text-rose-600">Danger Zone</h4>
                <p className="text-xs text-rose-400">Delete all your local data permanently</p>
              </div>
              <button 
                onClick={() => setShowResetModal(true)}
                className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-200 transition-colors"
              >
                <Trash2 size={18} /> Reset
              </button>
           </div>
        </div>
      </div>

      <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-2xl shadow-indigo-200">
        <h3 className="text-xl font-bold mb-2">Did you know?</h3>
        <p className="text-indigo-100 text-sm leading-relaxed">
          CineRank's ranking algorithm uses a special "U-shaped" freshness formula. 
          It prioritizes movies you just added AND those you added a long time ago, 
          making sure your oldest backlog gems don't get buried forever!
        </p>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowResetModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in duration-200">
            <div className="text-center">
               <div className="inline-block p-4 bg-rose-100 text-rose-600 rounded-full mb-4">
                 <RotateCcw size={32} />
               </div>
               <h3 className="text-2xl font-bold text-gray-900">Nuke Everything?</h3>
               <p className="text-gray-500 mt-2">This will delete your entire movie library. This action cannot be undone.</p>
            </div>
            
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Type "DELETE" to confirm</label>
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-center text-lg font-black text-rose-600 focus:border-rose-300 outline-none"
                placeholder="..."
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-2">
               <button 
                 onClick={() => setShowResetModal(false)}
                 className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700"
               >
                 Cancel
               </button>
               <button 
                 disabled={resetConfirm !== 'DELETE'}
                 onClick={() => {
                   onReset();
                   setShowResetModal(false);
                   setResetConfirm('');
                 }}
                 className={`flex-1 py-4 rounded-2xl font-black text-white transition-all shadow-lg ${
                   resetConfirm === 'DELETE' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-gray-200 cursor-not-allowed'
                 }`}
               >
                 DELETE ALL
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
