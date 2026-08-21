import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || !['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Use a JPEG or PNG image up to 5MB.' }, { status: 400 })
  const blob = await put(`profile-photos/${user.id}-${Date.now()}.${file.type === 'image/png' ? 'png' : 'jpg'}`, file, { access: 'private', addRandomSuffix: false })
  const { error } = await supabase.from('profiles').update({ avatar_path: blob.pathname }).eq('id', user.id)
  if (error) return NextResponse.json({ error: 'Could not save profile photo.' }, { status: 500 })
  return NextResponse.json({ pathname: blob.pathname })
}
