import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year  = searchParams.get('year');
  const month = searchParams.get('month');
  const day   = searchParams.get('day');

  if (!year || !month || !day) {
    return NextResponse.json({ error: 'Missing date params' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://orthocal.info/api/gregorian/${year}/${month}/${day}/`,
      { next: { revalidate: 86400 } } // cache for 24 hours
    );
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Orthocal fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
