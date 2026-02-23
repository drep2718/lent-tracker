import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  const { location } = await params;

  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get('date');

  let date: string;
  if (dateParam) {
    date = dateParam;
  } else {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    date = `${mm}-${dd}-${yyyy}`;
  }

  const url = `https://api.hfs.purdue.edu/menus/v2/locations/${encodeURIComponent(location)}/${date}/`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Menu fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}
