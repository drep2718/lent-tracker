'use client';

import { useState, useEffect } from 'react';

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  content: string;
  paragraph_start: boolean;
}

interface Reading {
  source: string;
  book: string;
  description: string;
  display: string;
  short_display: string;
  passage: Verse[];
}

interface Story {
  title: string;
  story: string; // HTML
}

interface OrthoCalData {
  titles: string[];
  summary_title: string;
  feasts: string[];
  fast_level_desc: string;
  fast_exception_desc: string;
  saints: string[];
  readings: Reading[];
  stories: Story[];
  service_notes: string;
}

function passageText(verses: Verse[]): string {
  return verses
    .map((v, i) => {
      const prefix = i === 0 || v.paragraph_start ? `[${v.chapter}:${v.verse}] ` : '';
      return prefix + v.content;
    })
    .join(' ');
}

// Only show liturgically meaningful readings
const PRIORITY_SOURCES = ['Epistle', 'Gospel', '6th Hour', '3rd Hour', '9th Hour', 'Vespers'];
function readingPriority(r: Reading): number {
  const idx = PRIORITY_SOURCES.indexOf(r.source);
  return idx === -1 ? 99 : idx;
}

function ReadingCard({ reading }: { reading: Reading }) {
  const [open, setOpen] = useState(false);
  const text = passageText(reading.passage ?? []);

  const sourceLabel: Record<string, string> = {
    Epistle: 'Epistle',
    Gospel: 'Gospel',
    '6th Hour': 'Sixth Hour (OT)',
    '3rd Hour': 'Third Hour',
    '9th Hour': 'Ninth Hour',
    Vespers: 'Vespers',
    '5th Matins Gospel': 'Matins Gospel',
  };

  const isGospel = reading.source === 'Gospel';
  const isEpistle = reading.source === 'Epistle';

  return (
    <div className={`rounded-lg border overflow-hidden ${
      isGospel  ? 'border-amber-800/50 bg-amber-950/10' :
      isEpistle ? 'border-zinc-700 bg-zinc-900/30' :
                  'border-zinc-800 bg-zinc-900/20'
    }`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider mr-2 ${
            isGospel ? 'text-amber-400' : 'text-zinc-500'
          }`}>
            {sourceLabel[reading.source] ?? reading.source}
          </span>
          <span className="text-sm font-medium text-zinc-200">{reading.display}</span>
        </div>
        <span className={`text-zinc-500 text-xs transition-transform duration-200 flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && text && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-800/60">
          <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

function SaintCard({ story }: { story: Story }) {
  const [open, setOpen] = useState(false);
  // Strip HTML tags for plain text
  const plainText = story.story.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left gap-2"
      >
        <span className="text-sm font-medium text-zinc-200">{story.title}</span>
        <span className={`text-zinc-500 text-xs transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-800/60">
          <p className="text-sm text-zinc-400 leading-relaxed">{plainText}</p>
        </div>
      )}
    </div>
  );
}

export default function DailyReadings() {
  const [data, setData] = useState<OrthoCalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionOpen, setSectionOpen] = useState(true);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    fetch(`/api/orthocal?year=${y}&month=${m}&day=${d}`)
      .then((r) => r.json())
      .then((data) => { setData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-500">Loading daily readings…</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const priorityReadings = [...(data.readings ?? [])]
    .sort((a, b) => readingPriority(a) - readingPriority(b))
    .filter((r) => PRIORITY_SOURCES.includes(r.source));

  const hasReadings = priorityReadings.length > 0;
  const hasStories  = (data.stories ?? []).length > 0;
  const hasSaints   = (data.saints ?? []).length > 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setSectionOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Today&apos;s Readings &amp; Saints
          </p>
          {data.summary_title && (
            <p className="text-sm font-medium text-zinc-200 mt-0.5">{data.summary_title}</p>
          )}
        </div>
        <span className={`text-zinc-500 text-xs transition-transform duration-200 ${sectionOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {sectionOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-800/60 pt-3">

          {/* Saints list */}
          {hasSaints && (
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Commemorated Today
              </p>
              <div className="space-y-1.5">
                {hasStories
                  ? data.stories.map((s) => <SaintCard key={s.title} story={s} />)
                  : data.saints.map((name) => (
                      <p key={name} className="text-sm text-zinc-300 pl-1">• {name}</p>
                    ))}
              </div>
            </div>
          )}

          {/* Readings */}
          {hasReadings && (
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Scripture Readings
              </p>
              <div className="space-y-2">
                {priorityReadings.map((r) => (
                  <ReadingCard key={`${r.source}-${r.display}`} reading={r} />
                ))}
              </div>
            </div>
          )}

          {/* Service notes */}
          {data.service_notes && (
            <p className="text-xs text-zinc-600 italic">{data.service_notes}</p>
          )}

          <p className="text-xs text-zinc-700">
            Readings via <span className="text-zinc-600">orthocal.info</span>
          </p>
        </div>
      )}
    </div>
  );
}
