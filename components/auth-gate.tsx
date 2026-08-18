'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import APAPPSDashboard from '@/components/apapps-dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ShieldCheck, ArrowRight, Loader2, LogOut } from 'lucide-react'

const ADMIN_EMAIL = 'princeasari2004@gmail.com'

type Mode = 'admin' | 'student'

export function AuthGate() {
  const supabase = createClient()
  const [user, setUser] = useState<{ id?: string; email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const [role, setRole] = useState<'student' | 'admin' | null>(null)
  const [mode, setMode] = useState<Mode>('admin')
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
        setRole(profile?.role === 'admin' ? 'admin' : 'student')
      }
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setRole(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage(''); setLoading(true)
    if (!supabase) { setMessage('Supabase is not configured in this preview.'); setLoading(false); return }
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } })
      if (error) setMessage(error.message.toLowerCase().includes('password') ? error.message : 'Unable to create account. Check your details and try again.')
      else if (data.session) setMessage('Account created. Welcome to APAPPS.')
      else setMessage('Account created. Check your email to confirm your account.')
    } else {
      if (mode === 'admin' && email.trim().toLowerCase() !== ADMIN_EMAIL) {
        setMessage('Use the administrator email assigned to this workspace.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message.toLowerCase().includes('confirm') ? 'Please confirm your email before signing in.' : 'Invalid email or password.')
      else if (mode === 'admin') {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
        if (profile?.role !== 'admin') {
          await supabase.auth.signOut()
          setMessage('This account is not authorized for administrator access.')
        } else setRole('admin')
      }
    }
    setLoading(false)
  }

  if (loading && !user) return <main className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></main>
  if (user && role) return <div className="relative"><div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3"><p className="text-sm text-muted-foreground">Signed in as <span className="text-foreground">{user.email}</span></p><Button variant="ghost" size="sm" onClick={() => supabase?.auth.signOut()}><LogOut data-icon="inline-start" /> Sign out</Button></div><APAPPSDashboard /></div>

  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-md border-border/80 shadow-2xl"><CardHeader className="gap-4"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap /></div><div><p className="font-mono text-xs tracking-[0.2em] text-primary">APAPPS</p><CardTitle className="text-2xl">Academic intelligence</CardTitle></div></div><CardDescription>{isSignup ? 'Create your student account to access your performance space.' : mode === 'admin' ? 'Secure lecturer and administrator access.' : 'Sign in to your student performance space.'}</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1"><Button variant={mode === 'admin' ? 'secondary' : 'ghost'} onClick={() => { setMode('admin'); setIsSignup(false) }}><ShieldCheck data-icon="inline-start" /> Admin login</Button><Button variant={mode === 'student' ? 'secondary' : 'ghost'} onClick={() => { setMode('student'); setIsSignup(true) }}><GraduationCap data-icon="inline-start" /> Student signup</Button></div><form onSubmit={submit} className="flex flex-col gap-4">{isSignup && <div className="flex flex-col gap-2"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" /></div>}<div className="flex flex-col gap-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={mode === 'admin' ? ADMIN_EMAIL : 'student@university.edu'} /></div><div className="flex flex-col gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" /></div>{message && <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p>}<Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <ArrowRight data-icon="inline-start" />}{isSignup ? 'Create student account' : 'Sign in securely'}</Button></form>{mode === 'admin' && <p className="text-center text-xs text-muted-foreground">Admin email: {ADMIN_EMAIL}. Use the password configured during account setup.</p>}{mode === 'student' && <p className="text-center text-xs text-muted-foreground">Email confirmation may be required before your first sign in.</p>}</CardContent></Card></main>
}
