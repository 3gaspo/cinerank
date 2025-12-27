
import React, { useMemo, useState } from 'react';
import { Movie, MovieStatus } from '../types';
import { 
  format, 
  parseISO, 
  startOfDay, 
  eachDayOfInterval, 
  subDays, 
  subMonths, 
  subYears, 
  isSameDay, 
  differenceInDays, 
  startOfWeek, 
  startOfMonth, 
  startOfYear,
  getYear,
  getMonth,
  getWeek,
  isSameWeek,
  isSameMonth
} from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Target, Trophy, TrendingUp } from 'lucide-react';

interface StatsProps {
  movies: Movie[];
}

const Stats: React.FC<StatsProps> = ({ movies }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const watchedMovies = useMemo(() => 
    movies.filter(m => m.status === MovieStatus.WATCHED && m.dateWatched)
  , [movies]);

  const stats = useMemo(() => {
    if (watchedMovies.length === 0) return null;

    const now = new Date();
    const sortedWatched = [...watchedMovies].sort((a, b) => 
      parseISO(a.dateWatched!).getTime() - parseISO(b.dateWatched!).getTime()
    );
    const firstWatchedDate = parseISO(sortedWatched[0].dateWatched!);
    const totalDaysSinceStart = Math.max(1, differenceInDays(now, firstWatchedDate));

    // Averages calculation: (Total Watched) / (Total Units of Time)
    let averageVal = 0;
    if (period === 'weekly') {
      const weeksElapsed = Math.max(1, totalDaysSinceStart / 7);
      averageVal = watchedMovies.length / weeksElapsed;
    } else if (period === 'monthly') {
      const monthsElapsed = Math.max(1, totalDaysSinceStart / 30.44);
      averageVal = watchedMovies.length / monthsElapsed;
    } else {
      const yearsElapsed = Math.max(1, totalDaysSinceStart / 365.25);
      averageVal = watchedMovies.length / yearsElapsed;
    }

    // Streak calculation based on period
    let streak = 0;
    const watchedByDay = new Map<string, number>();
    watchedMovies.forEach(m => {
      const d = format(parseISO(m.dateWatched!), 'yyyy-MM-dd');
      watchedByDay.set(d, (watchedByDay.get(d) || 0) + 1);
    });

    if (period === 'weekly') {
      // Daily streak
      let checkDate = startOfDay(now);
      while (watchedByDay.has(format(checkDate, 'yyyy-MM-dd'))) {
        streak++;
        checkDate = subDays(checkDate, 1);
      }
      if (streak === 0) {
        checkDate = subDays(startOfDay(now), 1);
        while (watchedByDay.has(format(checkDate, 'yyyy-MM-dd'))) {
          streak++;
          checkDate = subDays(checkDate, 1);
        }
      }
    } else if (period === 'monthly') {
      // Weekly streak
      const weeks = new Set<string>();
      watchedMovies.forEach(m => weeks.add(format(startOfWeek(parseISO(m.dateWatched!)), 'yyyy-ww')));
      let checkWeek = startOfWeek(now);
      while (weeks.has(format(checkWeek, 'yyyy-ww'))) {
        streak++;
        checkWeek = subDays(checkWeek, 7);
      }
      if (streak === 0) {
        checkWeek = subDays(startOfWeek(now), 7);
        while (weeks.has(format(checkWeek, 'yyyy-ww'))) {
          streak++;
          checkWeek = subDays(checkWeek, 7);
        }
      }
    } else {
      // Monthly streak
      const monthsSet = new Set<string>();
      watchedMovies.forEach(m => monthsSet.add(format(startOfMonth(parseISO(m.dateWatched!)), 'yyyy-MM')));
      let checkMonth = startOfMonth(now);
      while (monthsSet.has(format(checkMonth, 'yyyy-MM'))) {
        streak++;
        checkMonth = subMonths(checkMonth, 1);
      }
      if (streak === 0) {
        checkMonth = subMonths(startOfMonth(now), 1);
        while (monthsSet.has(format(checkMonth, 'yyyy-MM'))) {
          streak++;
          checkMonth = subMonths(checkMonth, 1);
        }
      }
    }

    // Chart data
    let chartInterval: { start: Date; end: Date };
    if (period === 'weekly') chartInterval = { start: subDays(now, 14), end: now };
    else if (period === 'monthly') chartInterval = { start: subMonths(now, 6), end: now };
    else chartInterval = { start: subYears(now, 2), end: now };

    let chartData: { label: string; count: number }[] = [];
    if (period === 'weekly') {
      const days = eachDayOfInterval(chartInterval);
      chartData = days.map(d => ({
        label: format(d, 'MMM d'),
        count: watchedMovies.filter(m => isSameDay(parseISO(m.dateWatched!), d)).length
      }));
    } else if (period === 'monthly') {
      const weeksArr: Date[] = [];
      let curr = chartInterval.start;
      while (curr <= chartInterval.end) {
        weeksArr.push(startOfWeek(curr));
        curr = subDays(curr, -7);
      }
      chartData = weeksArr.map(w => ({
        label: 'W' + format(w, 'w'),
        count: watchedMovies.filter(m => isSameWeek(parseISO(m.dateWatched!), w)).length
      }));
    } else {
      let curr = startOfMonth(chartInterval.start);
      while (curr <= chartInterval.end) {
        chartData.push({
          label: format(curr, 'MMM yy'),
          count: watchedMovies.filter(m => isSameMonth(parseISO(m.dateWatched!), curr)).length
        });
        curr = subMonths(curr, -1);
      }
    }

    return {
      total: watchedMovies.length,
      average: averageVal.toFixed(1),
      streak,
      chartData
    };
  }, [watchedMovies, period]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics</h2>
          <p className="text-gray-500 font-medium">Your movie habits revealed</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          {['weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`flex-1 md:w-28 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {!stats ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Target size={64} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Not enough data</h2>
          <p className="text-gray-500 mt-2">Log some watched movies to see your patterns!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <Trophy className="text-amber-500 mb-2" size={24} />
              <span className="text-3xl font-black text-gray-900">{stats.total}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Total Movies</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <TrendingUp className="text-indigo-500 mb-2" size={24} />
              <span className="text-3xl font-black text-gray-900">{stats.average}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Avg / {period.slice(0, -2)}</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <Flame className="text-rose-500 mb-2" size={24} />
              <span className="text-3xl font-black text-gray-900">{stats.streak}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">{period === 'weekly' ? 'Daily' : period === 'monthly' ? 'Weekly' : 'Monthly'} Streak</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-800">Watching Trends</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;
