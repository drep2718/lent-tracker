'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DiningMenu, MenuItem, Filters } from '@/types/menu';
import FoodLog from './FoodLog';
import QRScanner from './QRScanner';

const LOCATIONS = [
  { id: 'Wiley', label: 'Wiley' },
  { id: 'Ford', label: 'Ford' },
  { id: 'Hillenbrand', label: 'Hillenbrand' },
  { id: 'Earhart', label: 'Earhart' },
  { id: 'Windsor', label: 'Windsor' },
  { id: '1bowl at Meredith Hall', label: '1Bowl' },
];

type ActiveTab = 'menu' | 'log' | 'scanner';

// The API encodes dietary labels (Vegetarian, Vegan) inside the Allergens array.
// IsVegetarian / IsVegan fields are unreliable — always use allergen tag lookups.
function hasTag(item: MenuItem, name: string): boolean {
  if (!Array.isArray(item.Allergens)) return false;
  return item.Allergens.some(
    (a) => a.Name.toLowerCase() === name.toLowerCase() && a.Value === true
  );
}

function passesFilters(item: MenuItem, filters: Filters): boolean {
  if (filters.avoidMeat) {
    // Must be tagged Vegetarian (excludes meat + poultry), and no fish/shellfish
    if (!hasTag(item, 'Vegetarian')) return false;
    if (hasTag(item, 'Fish')) return false;
    if (hasTag(item, 'Shellfish')) return false;
  }
  if (filters.avoidDairy && hasTag(item, 'Milk')) return false;
  if (filters.avoidEggs && hasTag(item, 'Eggs')) return false;
  // Best proxy for oil-free: item is tagged Vegan
  if (filters.avoidOil && !hasTag(item, 'Vegan')) return false;
  return true;
}

function formatDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function toInputDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fromInputDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  activeClass: string;
  switchColor: string;
}

function Toggle({ id, checked, onChange, label, description, activeClass, switchColor }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        checked ? activeClass : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500'
      }`}
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? switchColor : 'bg-zinc-700'}`} />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <div className="min-w-0">
        <div className={`font-semibold text-sm ${checked ? 'text-zinc-100' : 'text-zinc-300'}`}>
          {label}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</div>
      </div>
    </label>
  );
}

function ItemBadges({ item }: { item: MenuItem }) {
  const badges: { label: string; cls: string }[] = [];
  if (hasTag(item, 'Vegan')) badges.push({ label: 'Vegan', cls: 'bg-green-900/60 text-green-300 border-green-700' });
  else if (hasTag(item, 'Vegetarian')) badges.push({ label: 'Vegetarian', cls: 'bg-lime-900/60 text-lime-300 border-lime-700' });
  if (hasTag(item, 'Milk')) badges.push({ label: 'Dairy', cls: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' });
  if (hasTag(item, 'Eggs')) badges.push({ label: 'Eggs', cls: 'bg-orange-900/60 text-orange-300 border-orange-700' });
  if (hasTag(item, 'Fish') || hasTag(item, 'Shellfish'))
    badges.push({ label: 'Seafood', cls: 'bg-blue-900/60 text-blue-300 border-blue-700' });

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {badges.map((b) => (
        <span key={b.label} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${b.cls}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');

  const [filters, setFilters] = useState<Filters>({
    avoidMeat: true,
    avoidDairy: true,
    avoidEggs: true,
    avoidOil: false,
  });

  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].id);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [menu, setMenu] = useState<DiningMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>('');

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMenu(null);
    try {
      const dateStr = formatDate(selectedDate);
      const res = await fetch(`/api/menus/${encodeURIComponent(selectedLocation)}?date=${dateStr}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DiningMenu = await res.json();
      setMenu(data);
      if (data.Meals?.length > 0) {
        // auto-select the current meal or first available
        const hour = new Date().getHours();
        const mealGuess =
          hour < 10 ? 'Breakfast' : hour < 15 ? 'Lunch' : 'Dinner';
        const match = data.Meals.find((m) => m.Name === mealGuess) ?? data.Meals[0];
        setSelectedMeal(match.Name);
      }
    } catch {
      setError('Could not load menu. The dining court may be closed or no menu is posted for this date.');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedDate]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const setFilter = (key: keyof Filters) => (val: boolean) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const activeMeal = menu?.Meals?.find((m) => m.Name === selectedMeal);

  const filteredStations: { station: string; items: MenuItem[] }[] = [];
  let totalCount = 0;

  if (activeMeal) {
    for (const station of activeMeal.Stations ?? []) {
      const filtered = (station.Items ?? []).filter((item) => passesFilters(item, filters));
      if (filtered.length > 0) {
        filteredStations.push({ station: station.Name, items: filtered });
        totalCount += filtered.length;
      }
    }
  }

  const activeFilterLabels = [
    filters.avoidMeat && 'no meat or seafood',
    filters.avoidDairy && 'no dairy',
    filters.avoidEggs && 'no eggs',
    filters.avoidOil && 'no oil (vegan only)',
  ].filter(Boolean) as string[];

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'menu', label: '🍽 Menu' },
    { id: 'log', label: '📖 Food Log' },
    { id: 'scanner', label: '📷 QR Scan' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center gap-3 pb-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-900/50 border border-amber-700/50 text-amber-300 text-lg font-bold">
              ✝
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-200 leading-tight">
                Purdue Orthodox Lent Menu
              </h1>
              <p className="text-xs text-zinc-500 leading-none">
                Filter dining menus for fasting — meat · dairy · eggs · oil
              </p>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── MENU TAB ── */}
        {activeTab === 'menu' && (
          <>
            {/* Fasting Toggles */}
            <section>
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                I am currently fasting from…
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Toggle
                  id="meat"
                  checked={filters.avoidMeat}
                  onChange={setFilter('avoidMeat')}
                  label="🥩 Meat & Seafood"
                  description="Hides non-vegetarian items plus fish and shellfish"
                  activeClass="border-red-700/60 bg-red-950/30"
                  switchColor="bg-red-600"
                />
                <Toggle
                  id="dairy"
                  checked={filters.avoidDairy}
                  onChange={setFilter('avoidDairy')}
                  label="🧀 Dairy"
                  description="Hides items containing milk or milk-derived products"
                  activeClass="border-yellow-700/60 bg-yellow-950/30"
                  switchColor="bg-yellow-600"
                />
                <Toggle
                  id="eggs"
                  checked={filters.avoidEggs}
                  onChange={setFilter('avoidEggs')}
                  label="🥚 Eggs"
                  description="Hides items containing eggs"
                  activeClass="border-orange-700/60 bg-orange-950/30"
                  switchColor="bg-orange-600"
                />
                <Toggle
                  id="oil"
                  checked={filters.avoidOil}
                  onChange={setFilter('avoidOil')}
                  label="🫒 Oil & Alcohol"
                  description="Shows only vegan-tagged items (best approximation available)"
                  activeClass="border-purple-700/60 bg-purple-950/30"
                  switchColor="bg-purple-600"
                />
              </div>

              {filters.avoidOil && (
                <div className="mt-3 text-xs text-purple-300 bg-purple-950/30 border border-purple-800/40 rounded-lg px-3 py-2.5 flex gap-2">
                  <span className="flex-shrink-0">⚠</span>
                  <span>
                    Oil content is <strong>not tagged</strong> in Purdue&apos;s menu data. Showing only
                    items marked <strong>Vegan</strong> as the closest filter. Confirm with dining staff
                    on strict oil-free days.
                  </span>
                </div>
              )}
            </section>

            {/* Date + Location */}
            <section className="flex flex-col sm:flex-row gap-4 items-start">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={toInputDate(selectedDate)}
                  onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                  Dining Court
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedLocation === loc.id
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Meal Tabs */}
            {!loading && menu && menu.Meals?.length > 0 && (
              <div className="flex gap-1 border-b border-zinc-800">
                {menu.Meals.map((meal) => (
                  <button
                    key={meal.Name}
                    onClick={() => setSelectedMeal(meal.Name)}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${
                      selectedMeal === meal.Name
                        ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {meal.Name}
                    {meal.Hours?.StartTime && (
                      <span className="ml-2 text-[11px] font-normal opacity-50">
                        {meal.Hours.StartTime}–{meal.Hours.EndTime}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-zinc-500 text-sm">Loading menu…</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-6 text-center space-y-3">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchMenu}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-200 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && !error && menu && activeMeal && (
              <div className="space-y-5">
                {/* Summary */}
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3">
                  <span className="text-xl opacity-70">✝</span>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-amber-300 font-bold">{totalCount}</span>
                      <span className="text-zinc-400"> item{totalCount !== 1 ? 's' : ''} available at </span>
                      <span className="text-zinc-200 font-semibold">{menu.Location}</span>
                      <span className="text-zinc-400"> — {selectedMeal}</span>
                    </p>
                    {activeFilterLabels.length > 0 ? (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Fasting from: {activeFilterLabels.join(' · ')}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500 mt-0.5">No restrictions active — showing all items</p>
                    )}
                  </div>
                </div>

                {/* Station cards */}
                {filteredStations.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <p className="text-5xl">🕊</p>
                    <p className="text-zinc-300 font-semibold">No items match your current fast.</p>
                    <p className="text-zinc-600 text-sm">
                      Try another dining court or loosen a restriction.
                    </p>
                  </div>
                ) : (
                  filteredStations.map(({ station, items }) => (
                    <div key={station}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          {station}
                        </span>
                        <div className="h-px flex-1 bg-zinc-800" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((item) => (
                          <div
                            key={item.ID}
                            className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 hover:border-zinc-600 hover:bg-zinc-900 transition-all"
                          >
                            <p className="text-sm font-medium text-zinc-100 leading-snug">{item.Name}</p>
                            <ItemBadges item={item} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!loading && !error && menu && !menu.IsPublished && (
              <div className="text-center py-10 text-zinc-500 text-sm">
                Menu not yet published for this date.
              </div>
            )}
          </>
        )}

        {/* ── FOOD LOG TAB ── */}
        {activeTab === 'log' && <FoodLog />}

        {/* ── QR SCANNER TAB ── */}
        {activeTab === 'scanner' && <QRScanner />}

      </main>

      <footer className="border-t border-zinc-800 mt-12 py-6 text-center text-xs text-zinc-600 space-y-1">
        <p>Menu data from <span className="text-zinc-500">api.hfs.purdue.edu</span> · Allergen tags may not reflect all ingredients</p>
        <p>God bless your fast ✝</p>
      </footer>
    </div>
  );
}
