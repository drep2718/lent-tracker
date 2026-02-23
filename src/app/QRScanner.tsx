'use client';

import { useState, useEffect, useRef } from 'react';

interface ProductInfo {
  name: string;
  ingredients: string;
  hasMeat: boolean;
  hasDairy: boolean;
  hasEggs: boolean;
  confidence: 'high' | 'low';
  barcode: string;
}

const MEAT_KEYWORDS = [
  'beef', 'pork', 'chicken', 'turkey', 'lamb', 'veal', 'duck', 'goose',
  'rabbit', 'venison', 'bison', 'meat', 'poultry', 'ham', 'bacon', 'sausage',
  'salami', 'pepperoni', 'prosciutto', 'lard', 'tallow', 'gelatin', 'collagen',
  'fish', 'tuna', 'salmon', 'cod', 'shrimp', 'lobster', 'crab', 'shellfish',
  'anchovy', 'anchovies', 'sardine', 'tilapia', 'halibut', 'mahi', 'trout',
  'animal fat', 'bone broth', 'chicken broth', 'beef broth', 'chicken stock',
  'beef stock', 'pork fat', 'beef fat', 'chicken fat', 'suet',
];

function detectMeat(ingredients: string): boolean {
  const lower = ingredients.toLowerCase();
  return MEAT_KEYWORDS.some((k) => {
    const idx = lower.indexOf(k);
    if (idx === -1) return false;
    // Make sure it's a whole word (not e.g. "chicken" inside another word)
    const before = idx > 0 ? lower[idx - 1] : ' ';
    const after = idx + k.length < lower.length ? lower[idx + k.length] : ' ';
    return /\W/.test(before) && /\W/.test(after);
  });
}

async function lookupBarcode(code: string): Promise<ProductInfo | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}?fields=product_name,ingredients_text,allergens_tags`,
      { headers: { 'User-Agent': 'PurdueLentMenu/1.0 (lent menu app)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name: string = p.product_name || 'Unknown product';
    const ingredients: string = p.ingredients_text || '';
    const allergens: string[] = p.allergens_tags || [];

    const hasDairy = allergens.some((a) => a.includes('milk') || a.includes('dairy'));
    const hasEggs = allergens.some((a) => a.includes('egg'));
    const hasMeat = detectMeat(ingredients);

    return {
      name,
      ingredients,
      hasMeat,
      hasDairy,
      hasEggs,
      confidence: ingredients ? 'high' : 'low',
      barcode: code,
    };
  } catch {
    return null;
  }
}

type ScannerState = 'idle' | 'starting' | 'scanning' | 'loading' | 'done' | 'error' | 'not_found';

export default function QRScanner() {
  const [state, setState] = useState<ScannerState>('idle');
  const [result, setResult] = useState<ProductInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const instanceRef = useRef<{ stop: () => Promise<void> } | null>(null);

  // Start scanner after the div is rendered
  useEffect(() => {
    if (!showScanner) return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode('qr-reader-div');
        instanceRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            if (cancelled) return;
            try { await scanner.stop(); } catch { /* ignore */ }
            instanceRef.current = null;
            setShowScanner(false);
            setState('loading');
            const info = await lookupBarcode(decodedText);
            if (cancelled) return;
            if (info) {
              setResult(info);
              setState('done');
            } else {
              setState('not_found');
            }
          },
          () => { /* per-frame errors — ignore */ }
        );

        setState('scanning');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
          setErrorMsg('Camera access denied. Please allow camera permissions and try again.');
        } else {
          setErrorMsg('Could not start the camera. Make sure you\'re on HTTPS and your device has a camera.');
        }
        setShowScanner(false);
        setState('error');
      }
    })();

    return () => {
      cancelled = true;
      instanceRef.current?.stop().catch(() => { /* ignore */ });
      instanceRef.current = null;
    };
  }, [showScanner]);

  function startScanning() {
    setResult(null);
    setErrorMsg('');
    setState('starting');
    setShowScanner(true);
  }

  async function stopScanning() {
    try { await instanceRef.current?.stop(); } catch { /* ignore */ }
    instanceRef.current = null;
    setShowScanner(false);
    setState('idle');
  }

  function reset() {
    setResult(null);
    setErrorMsg('');
    setState('idle');
  }

  const isActive = state === 'starting' || state === 'scanning';

  return (
    <div className="space-y-6">
      {/* Header card */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
            QR / Barcode Scanner
          </h2>
          <p className="text-sm text-zinc-400">
            Point your camera at a product&apos;s QR code or barcode to check for meat, dairy, and eggs.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isActive && state !== 'loading' && (
            <button
              onClick={state === 'done' || state === 'not_found' || state === 'error' ? reset : startScanning}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <span>📷</span>
              <span>{state === 'done' || state === 'not_found' || state === 'error' ? 'Scan another' : 'Start scanner'}</span>
            </button>
          )}
          {isActive && (
            <button
              onClick={stopScanning}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Camera view */}
      {showScanner && (
        <div className="rounded-xl overflow-hidden border border-zinc-700">
          <div id="qr-reader-div" />
          <p className="text-xs text-center text-zinc-500 py-2 bg-zinc-900">
            Center the barcode or QR code in the box
          </p>
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div className="flex items-center justify-center py-14">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-500 text-sm">Looking up product…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-5 space-y-3">
          <p className="text-red-400 text-sm">{errorMsg}</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Not found */}
      {state === 'not_found' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center space-y-2">
          <p className="text-3xl">🔍</p>
          <p className="text-zinc-300 font-semibold">Product not found</p>
          <p className="text-zinc-500 text-sm">
            This code isn&apos;t in the Open Food Facts database. Check the packaging manually.
          </p>
        </div>
      )}

      {/* Result */}
      {state === 'done' && result && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <p className="font-semibold text-zinc-100 text-base leading-snug">{result.name}</p>
            {result.confidence === 'low' && (
              <p className="text-xs text-amber-400 mt-1">
                ⚠ Limited ingredient data — results may be incomplete
              </p>
            )}
          </div>

          <div className="space-y-2">
            <ResultBadge label="Meat / Seafood" contains={result.hasMeat} emoji="🥩" />
            <ResultBadge label="Dairy" contains={result.hasDairy} emoji="🧀" />
            <ResultBadge label="Eggs" contains={result.hasEggs} emoji="🥚" />
          </div>

          {result.ingredients && (
            <details>
              <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 transition-colors select-none">
                View full ingredients
              </summary>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-2">
                {result.ingredients}
              </p>
            </details>
          )}

          <p className="text-xs text-zinc-600">
            Data from Open Food Facts · Barcode: {result.barcode}
          </p>
        </div>
      )}
    </div>
  );
}

function ResultBadge({
  label,
  contains,
  emoji,
}: {
  label: string;
  contains: boolean;
  emoji: string;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
        contains
          ? 'bg-red-950/40 border-red-800/60'
          : 'bg-green-950/30 border-green-900/60'
      }`}
    >
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <span>{emoji}</span>
        <span className={contains ? 'text-red-300' : 'text-green-300'}>{label}</span>
      </span>
      <span className={`text-sm font-bold ${contains ? 'text-red-400' : 'text-green-500'}`}>
        {contains ? 'Contains' : 'Not detected'}
      </span>
    </div>
  );
}
