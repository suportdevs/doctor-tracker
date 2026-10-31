import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Called by the admin after saving pages, menus or settings so the website updates immediately.
// Only signed-in users with the "website" permission may trigger it.
export async function POST(request) {
  const auth = request.headers.get('authorization') || '';
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: auth }, cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { user } = await res.json();
    if (!user.permissions.some((p) => p === '*' || p === 'website')) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ message: 'API unavailable' }, { status: 502 });
  }
  revalidateTag('cms');
  return NextResponse.json({ revalidated: true });
}
