import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const supabase = await createClient()
    const origin = new URL(request.url).origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })

    if (error) {
      console.error('[v0] Password recovery request failed:', error.message)
      return NextResponse.json({ error: 'We could not send the reset email. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({ message: 'If an account exists for that email, a password reset link has been sent.' })
  } catch (error) {
    console.error('[v0] Password recovery endpoint failed:', error)
    return NextResponse.json({ error: 'The password reset service is temporarily unavailable.' }, { status: 503 })
  }
}
