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
    const configuredRedirect = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
    const redirectTo = configuredRedirect || `${new URL(request.url).origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      console.error('[v0] Password recovery request failed:', error.message)
      const message = error.message.toLowerCase().includes('redirect') ? 'Password recovery is not enabled for this deployment yet. Please contact the administrator.' : error.message.toLowerCase().includes('rate') ? 'Too many reset requests. Please wait a few minutes and try again.' : 'We could not send the reset email. Please try again.'
      return NextResponse.json({ error: message }, { status: 502 })
    }

    return NextResponse.json({ message: 'If an account exists for that email, a password reset link has been sent.' })
  } catch (error) {
    console.error('[v0] Password recovery endpoint failed:', error)
    return NextResponse.json({ error: 'The password reset service is temporarily unavailable.' }, { status: 503 })
  }
}
