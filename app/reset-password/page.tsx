'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('Checking your reset link…')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) { setMessage('Supabase is not configured.'); return }
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') { setReady(true); setMessage('Choose a new password for your account.') }
    })
    supabase.auth.getSession().then(({ data }) => { if (data.session) { setReady(true); setMessage('Choose a new password for your account.') } })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function save(event: React.FormEvent) {
    event.preventDefault(); setMessage('')
    if (password.length < 8) return setMessage('Use at least 8 characters.')
    if (password !== confirmation) return setMessage('Passwords do not match.')
    setSaving(true)
    const { error } = await supabase!.auth.updateUser({ password })
    setMessage(error ? error.message : 'Password updated. You can now sign in with your new password.')
    setSaving(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-lg border-border/80 shadow-2xl"><CardHeader><CardTitle>Choose a new password</CardTitle><CardDescription>{message}</CardDescription></CardHeader><CardContent><form onSubmit={save} className="flex flex-col gap-4"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={!ready || saving} required /><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={!ready || saving} required /><Button type="submit" disabled={!ready || saving} className="rounded-xl">{saving ? 'Updating…' : 'Update password'}</Button></form></CardContent></Card></main>
}
