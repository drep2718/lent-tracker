'use client';

import { useState, useEffect } from 'react';
import { getLentenDayInfo, type LentenDayInfo, type FastLevel } from './lentenCalendar';

const FAST_COLORS: Record<FastLevel, { border: string; bg: string; badge: string; dot: string }> = {
  total:    { border: 'border-red-900/60',    bg: 'bg-red-950/30',    badge: 'bg-red-900/70 text-red-200 border-red-700',      dot: 'bg-red-500' },
  strict:   { border: 'border-zinc-700/60',   bg: 'bg-zinc-900/40',   badge: 'bg-zinc-800 text-zinc-300 border-zinc-600',       dot: 'bg-zinc-400' },
  oil_wine: { border: 'border-amber-800/50',  bg: 'bg-amber-950/20',  badge: 'bg-amber-900/60 text-amber-200 border-amber-700', dot: 'bg-amber-400' },
  fish:     { border: 'border-green-800/50',  bg: 'bg-green-950/20',  badge: 'bg-green-900/60 text-green-200 border-green-700', dot: 'bg-green-400' },
  pascha:   { border: 'border-yellow-600/60', bg: 'bg-yellow-950/30', badge: 'bg-yellow-700/60 text-yellow-100 border-yellow-500', dot: 'bg-yellow-300' },
};

export default function LentenBanner() {
  const [info, setInfo] = useState<LentenDayInfo | null | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setInfo(getLentenDayInfo());
  }, []);

  // Not yet mounted (avoid hydration mismatch)
  if (info === undefined) return null;

  // Outside of Lenten season
  if (info === null) return null;

  const c = FAST_COLORS[info.fastLevel];
  const ordinals = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Holy'];

  const weekLabel = info.isHolyWeek
    ? 'Holy Week'
    : `${ordinals[info.weekNumber]} Week of Great Lent`;

  const dayLabel = info.isPascha
    ? 'Pascha'
    : `Day ${info.dayNumber}`;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        {/* Colored dot */}
        <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${c.dot}`} />

        <div className="flex-1 min-w-0">
          {/* Day / week */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {dayLabel} · {weekLabel}
            </span>
            {info.specialName && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${c.badge}`}>
                {info.specialName}
              </span>
            )}
          </div>

          {/* Fast status */}
          <p className="text-sm font-medium text-zinc-200 mt-0.5">{info.fastNote}</p>
        </div>

        {/* Expand chevron */}
        <span className={`flex-shrink-0 text-zinc-500 text-xs mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/60 pt-3">
          {/* Significance */}
          {info.significance && (
            <p className="text-sm text-zinc-300 leading-relaxed">{info.significance}</p>
          )}

          {/* Verse */}
          <div className="border-l-2 border-amber-700/50 pl-3">
            <p className="text-sm text-zinc-200 italic leading-relaxed">{info.verse.text}</p>
            <p className="text-xs text-amber-400 mt-1 font-medium">— {info.verse.ref}</p>
          </div>

          {/* Week theme */}
          {!info.isPascha && (
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">
              {info.weekTheme}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
