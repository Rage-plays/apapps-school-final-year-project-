import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname || !pathname.startsWith('profile-photos/')) return NextResponse.json({ error: 'Invalid photo path' }, { status: 400 })
  const result = await get(pathname, { access: 'private' })
  if (!result) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType, 'Cache-Control': 'private, no-cache', ETag: result.blob.etag } })
}
