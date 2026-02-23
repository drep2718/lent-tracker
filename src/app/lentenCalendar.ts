// Orthodox Great Lent 2026 calendar data
// Clean Monday: February 23, 2026  |  Pascha: April 12, 2026
// Update LENT_START and PASCHA each year for future use.

export type FastLevel = 'total' | 'strict' | 'oil_wine' | 'fish' | 'pascha';

export interface Verse {
  ref: string;
  text: string;
}

export interface LentenDayInfo {
  isInLent: boolean;
  isPascha: boolean;
  isHolyWeek: boolean;
  dayNumber: number;   // 1 = Clean Monday … 49 = Holy Saturday, 50 = Pascha
  weekNumber: number;  // 1–6 = Great Lent, 7 = Holy Week
  weekTheme: string;
  specialName: string | null;
  significance: string | null;
  fastLevel: FastLevel;
  fastNote: string;
  verse: Verse;
}

// ── Dates ──────────────────────────────────────────────────────────────────
const LENT_START = new Date(2026, 1, 23); // Feb 23 2026 — Clean Monday
const PASCHA     = new Date(2026, 3, 12); // Apr 12 2026

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ── Week themes ────────────────────────────────────────────────────────────
const WEEK_THEMES: Record<number, string> = {
  1: 'Week of Repentance',
  2: 'Week of Faith',
  3: 'Week of the Holy Cross',
  4: 'Week of Humility',
  5: 'Week of Mercy',
  6: 'Week before Holy Week',
  7: 'Holy Week',
};

// ── Fallback verses by week (Mon–Fri / Sat–Sun) ───────────────────────────
// Indexed as [weekNumber][0=weekday, 1=weekend]
const WEEKLY_VERSES: Record<number, [Verse, Verse]> = {
  1: [
    { ref: 'Psalm 51:10', text: '"Create in me a clean heart, O God, and renew a right spirit within me."' },
    { ref: 'Joel 2:12',   text: '"Return to Me with all your heart, with fasting and weeping and mourning."' },
  ],
  2: [
    { ref: 'Hebrews 11:1', text: '"Faith is the substance of things hoped for, the evidence of things not seen."' },
    { ref: 'Matthew 5:8',  text: '"Blessed are the pure in heart, for they shall see God."' },
  ],
  3: [
    { ref: 'Galatians 6:14', text: '"Far be it from me to boast except in the cross of our Lord Jesus Christ."' },
    { ref: 'Galatians 2:20', text: '"I have been crucified with Christ. It is no longer I who live, but Christ who lives in me."' },
  ],
  4: [
    { ref: 'Luke 18:13',    text: '"God, be merciful to me, a sinner!"' },
    { ref: 'Philippians 3:14', text: '"I press toward the goal for the prize of the upward call of God in Christ Jesus."' },
  ],
  5: [
    { ref: 'Luke 7:47', text: '"Her sins, which are many, are forgiven — for she loved much."' },
    { ref: 'Isaiah 55:7', text: '"Let the wicked forsake his way… Let him return to the Lord, and He will have mercy on him."' },
  ],
  6: [
    { ref: 'John 12:32', text: '"And I, when I am lifted up from the earth, will draw all people to Myself."' },
    { ref: 'Matthew 21:9', text: '"Blessed is He who comes in the name of the Lord! Hosanna in the highest!"' },
  ],
  7: [
    { ref: 'Matthew 26:41', text: '"Watch and pray that you may not enter into temptation. The spirit indeed is willing, but the flesh is weak."' },
    { ref: 'John 13:34', text: '"A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another."' },
  ],
};

// ── Special days ───────────────────────────────────────────────────────────
interface SpecialDay {
  name: string;
  significance: string;
  fastLevel: FastLevel;
  verse: Verse;
}

const SPECIAL_DAYS: Record<string, SpecialDay> = {
  '2026-02-23': {
    name: 'Clean Monday',
    significance: 'Great Lent begins. We lay down our burdens with clean hearts, beginning 40 days of prayer, fasting, and repentance.',
    fastLevel: 'strict',
    verse: { ref: 'Isaiah 1:16–17', text: '"Wash yourselves; make yourselves clean; remove the evil of your deeds from before My eyes; cease to do evil, learn to do good."' },
  },
  '2026-02-28': {
    name: 'First Saturday of the Departed',
    significance: 'We pray for the repose of all the faithful departed — our family, friends, and all who have fallen asleep in the Lord throughout the ages.',
    fastLevel: 'oil_wine',
    verse: { ref: 'John 11:25', text: '"I am the resurrection and the life. Whoever believes in Me, though he die, yet shall he live."' },
  },
  '2026-03-01': {
    name: 'Sunday of Orthodoxy',
    significance: 'The first Sunday of Lent commemorates the restoration of holy icon veneration in 843 AD — the final triumph over the great heresy of Iconoclasm.',
    fastLevel: 'oil_wine',
    verse: { ref: 'Hebrews 13:8', text: '"Jesus Christ is the same yesterday and today and forever."' },
  },
  '2026-03-07': {
    name: 'Second Saturday of the Departed',
    significance: 'A second solemn commemoration of all souls who have fallen asleep in the hope of the Resurrection.',
    fastLevel: 'oil_wine',
    verse: { ref: '1 Thessalonians 4:14', text: '"For since we believe that Jesus died and rose again, even so, through Jesus, God will bring with Him those who have fallen asleep."' },
  },
  '2026-03-08': {
    name: 'Sunday of St. Gregory Palamas',
    significance: 'We honor St. Gregory Palamas (+1359), the great theologian of the divine light of Tabor and defender of the hesychast tradition of prayer.',
    fastLevel: 'oil_wine',
    verse: { ref: 'Matthew 5:8', text: '"Blessed are the pure in heart, for they shall see God."' },
  },
  '2026-03-09': {
    name: 'Forty Holy Martyrs of Sebaste',
    significance: 'Forty Roman soldiers who refused to renounce Christ and were martyred in a frozen lake in 320 AD. Wine and oil are permitted in their honor.',
    fastLevel: 'oil_wine',
    verse: { ref: 'Romans 8:18', text: '"I consider that the sufferings of this present time are not worth comparing with the glory that is to be revealed to us."' },
  },
  '2026-03-14': {
    name: 'Third Saturday of the Departed',
    significance: 'A third commemoration of the faithful departed. Koliva (blessed wheat) is offered in memory of those who have reposed.',
    fastLevel: 'oil_wine',
    verse: { ref: 'John 5:28–29', text: '"The hour is coming when all who are in the tombs will hear His voice and come out — those who have done good to the resurrection of life."' },
  },
  '2026-03-15': {
    name: 'Sunday of the Holy Cross',
    significance: 'The midpoint of Lent. The Holy Cross is brought out for veneration to strengthen us for the remaining weeks — as a weary traveler rests under a shady tree.',
    fastLevel: 'oil_wine',
    verse: { ref: 'Galatians 2:20', text: '"I have been crucified with Christ. It is no longer I who live, but Christ who lives in me."' },
  },
  '2026-03-21': {
    name: 'Fourth Saturday of the Departed',
    significance: 'The last of the Lenten Saturdays of the Departed. We pray once more for all the faithful who have reposed.',
    fastLevel: 'oil_wine',
    verse: { ref: '1 Corinthians 15:22', text: '"For as in Adam all die, so also in Christ shall all be made alive."' },
  },
  '2026-03-22': {
    name: 'Sunday of St. John Climacus',
    significance: 'We honor St. John Climacus, 7th-century monk and author of the Ladder of Divine Ascent — the classic guide to Orthodox spiritual life and prayer.',
    fastLevel: 'oil_wine',
    verse: { ref: 'Philippians 3:14', text: '"I press on toward the goal for the prize of the upward call of God in Christ Jesus."' },
  },
  '2026-03-25': {
    name: 'Annunciation of the Theotokos',
    significance: '🐟 One of the Twelve Great Feasts! The Archangel Gabriel announces to the Virgin Mary that she will bear the Son of God. Fish, wine, and oil are permitted today.',
    fastLevel: 'fish',
    verse: { ref: 'Luke 1:38', text: '"Behold, I am the servant of the Lord; let it be to me according to your word."' },
  },
  '2026-03-29': {
    name: 'Sunday of St. Mary of Egypt',
    significance: 'We honor St. Mary of Egypt (+421) — a great sinner who repented and spent 47 years alone in the desert, a luminous witness to God\'s mercy and transformation.',
    fastLevel: 'oil_wine',
    verse: { ref: 'Luke 15:7', text: '"There will be more joy in heaven over one sinner who repents than over ninety-nine righteous persons who need no repentance."' },
  },
  '2026-04-04': {
    name: 'Lazarus Saturday',
    significance: '🐟 Christ raises Lazarus from the dead — a foreshadowing of the Resurrection. Great Lent formally ends today. Fish, wine, and oil are permitted.',
    fastLevel: 'fish',
    verse: { ref: 'John 11:25', text: '"I am the resurrection and the life. Whoever believes in Me, though he die, yet shall he live."' },
  },
  '2026-04-05': {
    name: 'Palm Sunday',
    significance: '🐟 One of the Twelve Great Feasts! Christ enters Jerusalem in triumph as the crowd cries "Hosanna!" Fish, wine, and oil are permitted. Holy Week begins tonight.',
    fastLevel: 'fish',
    verse: { ref: 'Matthew 21:9', text: '"Hosanna to the Son of David! Blessed is He who comes in the name of the Lord! Hosanna in the highest!"' },
  },
  '2026-04-06': {
    name: 'Holy Monday',
    significance: 'Christ curses the barren fig tree — a call to bear fruit before the final hour. We hear the parable of the wicked tenants and begin the solemn services of Holy Week.',
    fastLevel: 'strict',
    verse: { ref: 'Matthew 24:42', text: '"Watch, therefore, for you do not know on what day your Lord is coming."' },
  },
  '2026-04-07': {
    name: 'Holy Tuesday',
    significance: 'Christ teaches in the Temple. We reflect on the Parable of the Ten Virgins — keep your lamps burning. "Behold, the Bridegroom comes at midnight."',
    fastLevel: 'strict',
    verse: { ref: 'Matthew 25:13', text: '"Watch therefore, for you know neither the day nor the hour."' },
  },
  '2026-04-08': {
    name: 'Holy Wednesday',
    significance: 'The sinful woman anoints Christ\'s feet with precious myrrh while Judas plots his betrayal. A day of deep reflection on love and treachery.',
    fastLevel: 'strict',
    verse: { ref: 'Matthew 26:13', text: '"Truly, I say to you, wherever this gospel is proclaimed in the whole world, what she has done will also be told in memory of her."' },
  },
  '2026-04-09': {
    name: 'Holy Thursday',
    significance: 'The Last Supper and the institution of the Holy Eucharist. Christ washes the disciples\' feet in humility. Wine and oil are permitted today.',
    fastLevel: 'oil_wine',
    verse: { ref: 'John 13:34', text: '"A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another."' },
  },
  '2026-04-10': {
    name: 'Great and Holy Friday',
    significance: 'The Crucifixion of our Lord. The strictest fast of the year — a total fast if possible. We stand at the foot of the Cross in mourning, love, and adoration.',
    fastLevel: 'total',
    verse: { ref: 'John 19:30', text: '"When Jesus had received the sour wine, He said, \'It is finished!\' And He bowed His head and gave up His spirit."' },
  },
  '2026-04-11': {
    name: 'Holy Saturday',
    significance: 'Christ lies in the tomb, having descended into Hades to free the souls of the righteous. We wait in silent, expectant hope. Wine is permitted; oil is not today.',
    fastLevel: 'strict',
    verse: { ref: 'Romans 6:4', text: '"We were buried therefore with Him by baptism into death, in order that, just as Christ was raised from the dead by the glory of the Father, we too might walk in newness of life."' },
  },
  '2026-04-12': {
    name: 'Holy Pascha — Christ is Risen!',
    significance: '🌟 The Feast of Feasts! The Resurrection of our Lord, God, and Savior Jesus Christ. All fasting ends. Χριστὸς Ἀνέστη! Christ is Risen! Truly He is Risen!',
    fastLevel: 'pascha',
    verse: { ref: '1 Corinthians 15:55–57', text: '"O death, where is your victory? O death, where is your sting?" … But thanks be to God, who gives us the victory through our Lord Jesus Christ.' },
  },
};

// ── Fast note descriptions ─────────────────────────────────────────────────
const FAST_NOTES: Record<FastLevel, string> = {
  total:    'Complete fast today (Great Friday)',
  strict:   'Strict fast — no meat, fish, dairy, eggs, oil, or wine',
  oil_wine: 'Oil & wine permitted today',
  fish:     'Fish, oil & wine permitted today',
  pascha:   'All fasting is lifted — Christ is Risen!',
};

// ── Main export ────────────────────────────────────────────────────────────
export function getLentenDayInfo(date?: Date): LentenDayInfo | null {
  const today = startOfDay(date ?? new Date());
  const lentStart = startOfDay(LENT_START);
  const pascha = startOfDay(PASCHA);

  const diffMs = today.getTime() - lentStart.getTime();
  const dayNumber = Math.floor(diffMs / 86400000) + 1; // 1-indexed

  // Not in Lent / Pascha season
  if (dayNumber < 1 || dayNumber > 50) return null;

  const isPascha = today.getTime() === pascha.getTime();
  const isHolyWeek = dayNumber >= 43 && dayNumber <= 49;
  const weekNumber = isPascha ? 7 : Math.min(7, Math.ceil(dayNumber / 7));
  const weekTheme = WEEK_THEMES[weekNumber] ?? 'Great Lent';

  // Default fast level by day of week (0=Sun, 6=Sat)
  const dow = today.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const defaultFastLevel: FastLevel = isPascha ? 'pascha' : isWeekend ? 'oil_wine' : 'strict';

  // Default verse by week
  const weekVerses = WEEKLY_VERSES[weekNumber];
  const defaultVerse = weekVerses ? weekVerses[isWeekend ? 1 : 0] : weekVerses?.[0];

  // Check for special day override
  const key = dateKey(today);
  const special = SPECIAL_DAYS[key];

  return {
    isInLent: true,
    isPascha,
    isHolyWeek,
    dayNumber,
    weekNumber,
    weekTheme,
    specialName: special?.name ?? null,
    significance: special?.significance ?? null,
    fastLevel: special?.fastLevel ?? defaultFastLevel,
    fastNote: FAST_NOTES[special?.fastLevel ?? defaultFastLevel],
    verse: special?.verse ?? defaultVerse ?? { ref: 'Psalm 51:1', text: '"Have mercy on me, O God, according to Your steadfast love."' },
  };
}
