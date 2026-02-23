'use client';

import { useState, useEffect } from 'react';

type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: Meal;
  food: string;
}

const STORAGE_KEY = 'lent-food-log';
const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function toInputDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function loadEntries(): FoodLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: FoodLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function FoodLog() {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [date, setDate] = useState('');
  const [meal, setMeal] = useState<Meal>('Breakfast');
  const [food, setFood] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDate(toInputDate(new Date()));
    setEntries(loadEntries());
    const hour = new Date().getHours();
    if (hour < 10) setMeal('Breakfast');
    else if (hour < 15) setMeal('Lunch');
    else if (hour < 21) setMeal('Dinner');
    else setMeal('Snack');
    setMounted(true);
  }, []);

  function addEntry() {
    if (!food.trim() || !date) return;
    const entry: FoodLogEntry = {
      id: Date.now().toString(),
      date,
      meal,
      food: food.trim(),
    };
    const next = [...entries, entry].sort(
      (a, b) => b.date.localeCompare(a.date) || MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal)
    );
    setEntries(next);
    saveEntries(next);
    setFood('');
  }

  function deleteEntry(id: string) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next);
  }

  // Group by date, sorted newest first
  const grouped = entries.reduce<Record<string, FoodLogEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Add Entry */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Log a meal</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Meal</label>
            <div className="flex flex-wrap gap-1.5">
              {MEALS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    meal === m
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1.5">What did you eat?</label>
          <textarea
            value={food}
            onChange={(e) => setFood(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addEntry(); }}
            placeholder="e.g. Oatmeal with berries, black coffee, salad with vinegar…"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder-zinc-600"
          />
          <p className="text-xs text-zinc-600 mt-1">Tip: Ctrl+Enter to save quickly</p>
        </div>

        <button
          onClick={addEntry}
          disabled={!food.trim()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Add to log
        </button>
      </section>

      {/* History */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📖</p>
          <p className="text-zinc-400 font-semibold">No meals logged yet.</p>
          <p className="text-zinc-600 text-sm">Start tracking your fast above.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">History</h2>
          {sortedDates.map((d) => (
            <div key={d} className="space-y-2">
              <p className="text-sm font-semibold text-amber-300">{formatDisplayDate(d)}</p>
              {MEALS.filter((m) => grouped[d].some((e) => e.meal === m)).map((m) => (
                <div key={m} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{m}</p>
                  <div className="space-y-2">
                    {grouped[d]
                      .filter((e) => e.meal === m)
                      .map((e) => (
                        <div key={e.id} className="flex items-start justify-between gap-2 group">
                          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{e.food}</p>
                          <button
                            onClick={() => deleteEntry(e.id)}
                            className="flex-shrink-0 text-zinc-600 hover:text-red-400 transition-colors text-xs mt-0.5 opacity-0 group-hover:opacity-100"
                            title="Delete entry"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
