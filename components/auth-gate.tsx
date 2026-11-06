'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import APAPPSDashboard from '@/components/apapps-dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ShieldCheck, Loader2, LogOut, UsersRound } from 'lucide-react'

const ADMIN_EMAIL = 'princeasari2004@gmail.com'
type AccessMode = 'admin' | 'lecturer' | 'student'
type Role = 'student' | 'admin' | 'lecturer'

export function AuthGate() {
  const supabase = createClient()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('verified')
  const [mode, setMode] = useState<AccessMode>('admin')
  const [signup, setSignup] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [name, setName] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [faculty, setFaculty] = useState('')
  const [programme, setProgramme] = useState('')
  const [level, setLevel] = useState('100')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [staffId, setStaffId] = useState('')
  const [title, setTitle] = useState('')
  const [officeLocation, setOfficeLocation] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadRole(nextUser: { id: string; email?: string } | null) {
    setUser(nextUser)
    if (!nextUser || !supabase) { setRole(null); setVerificationStatus('verified'); return }
    const { data } = await supabase.from('profiles').select('role, verification_status').eq('id', nextUser.id).maybeSingle()
    setRole(data?.role === 'admin' || data?.role === 'lecturer' ? data.role : 'student')
    setVerificationStatus(data?.verification_status === 'pending' || data?.verification_status === 'rejected' ? data.verification_status : 'verified')
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getUser().then(async ({ data }) => { await loadRole(data.user as { id: string; email?: string } | null); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void loadRole(session?.user as { id: string; email?: string } | null) })
    return () => listener.subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  async function requestPasswordReset(event: React.FormEvent) {
    event.preventDefault(); setMessage(''); setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const result = await response.json().catch(() => ({}))
      setMessage(response.ok ? result.message : result.error || 'We could not send the reset email. Please try again.')
    } catch {
      setMessage('Unable to reach the password reset service. Check your connection and try again.')
    } finally { setLoading(false) }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage(''); setLoading(true)
    if (!supabase) { setMessage('Supabase is not configured in this preview.'); setLoading(false); return }
    if (signup) {
      const lecturerSignup = mode === 'lecturer'
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: lecturerSignup ? { full_name: name, role: 'lecturer', staff_id: staffId, title, department, faculty, office_location: officeLocation, bio, verification_status: 'pending' } : { full_name: name, matric_number: matricNumber, department, faculty, programme, level, address, phone }, emailRedirectTo: `${window.location.origin}/auth/callback` } })
      setMessage(error ? (error.message.toLowerCase().includes('password') ? error.message : 'Unable to create account. Check your details and try again.') : lecturerSignup ? 'Lecturer account created. An administrator must verify your staff profile before student records become available.' : data.session ? 'Account created. Welcome to APAPPS.' : 'Account created. Check your email to confirm your account.')
    } else {
      if (mode === 'admin' && email.trim().toLowerCase() !== ADMIN_EMAIL) { setMessage('Use the administrator email assigned to this workspace.'); setLoading(false); return }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message.toLowerCase().includes('confirm') ? 'Please confirm your email before signing in.' : 'Invalid email or password.')
      else { await loadRole(data.user as { id: string; email?: string }); setMessage('') }
    }
    setLoading(false)
  }

  if (loading && !user) return <main className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></main>
  if (user && role && role === 'lecturer' && verificationStatus !== 'verified') return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-lg border-border/80 shadow-2xl"><CardHeader><div className="flex size-12 items-center justify-center rounded-2xl bg-warning/10 text-warning"><ShieldCheck /></div><CardTitle>{verificationStatus === 'pending' ? 'Verification in progress' : 'Verification required'}</CardTitle><CardDescription>{verificationStatus === 'pending' ? 'Your lecturer registration has been received. An administrator must verify your staff ID and teaching profile before you can access student records.' : 'Your lecturer profile needs attention before access can be granted. Contact the Academic Registry for next steps.'}</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">Once approved, you will have a personal teaching workspace for assigned courses, attendance, assessments, student support, interventions, and timetable entries.</div><Button variant="outline" className="rounded-xl" onClick={() => supabase?.auth.signOut()}><LogOut data-icon="inline-start" /> Sign out</Button></CardContent></Card></main>
  if (user && role) return <div className="relative"><div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3"><p className="text-sm text-muted-foreground">{role === 'admin' ? 'Administrator' : role === 'lecturer' ? 'Lecturer' : 'Student'} · <span className="text-foreground">{user.email}</span></p><Button variant="ghost" size="sm" onClick={() => supabase?.auth.signOut()}><LogOut data-icon="inline-start" /> Sign out</Button></div><APAPPSDashboard userRole={role} userId={user.id} /></div>

  if (recovery) return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-lg border-border/80 shadow-2xl"><CardHeader><CardTitle>Reset your password</CardTitle><CardDescription>Enter the email connected to your APAPPS account. We will send a secure reset link.</CardDescription></CardHeader><CardContent><form onSubmit={requestPasswordReset} className="flex flex-col gap-4"><Label htmlFor="recovery-email">Email address</Label><Input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /><Button type="submit" disabled={loading} className="rounded-xl">{loading ? 'Sending…' : 'Send reset link'}</Button>{message && <p className="text-sm leading-6 text-muted-foreground">{message}</p>}<Button type="button" variant="ghost" onClick={() => { setRecovery(false); setMessage('') }}>Back to sign in</Button></form></CardContent></Card></main>

  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-lg border-border/80 shadow-2xl"><CardHeader className="gap-4"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap /></div><div><p className="font-mono text-xs tracking-[0.2em] text-primary">APAPPS</p><CardTitle className="text-2xl">Academic intelligence</CardTitle></div></div><CardDescription>{signup ? 'Create a complete student profile for personalized academic insights.' : mode === 'admin' ? 'Secure administrator access to the full institution workspace.' : mode === 'lecturer' ? 'Monitor cohorts, enter records, and support student progress.' : 'Access your student performance space.'}</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1"><Button variant={mode === 'admin' ? 'secondary' : 'ghost'} onClick={() => { setMode('admin'); setSignup(false) }}><ShieldCheck data-icon="inline-start" />Admin</Button><Button variant={mode === 'lecturer' ? 'secondary' : 'ghost'} onClick={() => { setMode('lecturer'); setSignup(false) }}><UsersRound data-icon="inline-start" />Lecturer</Button><Button variant={mode === 'student' ? 'secondary' : 'ghost'} onClick={() => setMode('student')}><GraduationCap data-icon="inline-start" />Student</Button></div><form onSubmit={submit} className="flex flex-col gap-4">{signup && mode === 'lecturer' && <div className="flex flex-col gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-4"><div><p className="font-medium">Lecturer registration</p><p className="text-xs leading-5 text-muted-foreground">Submit your staff details for administrator verification.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="lecturer-name">Full name</Label><Input id="lecturer-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Jane Doe" /></div><div className="flex flex-col gap-2"><Label htmlFor="staff-id">Staff ID</Label><Input id="staff-id" value={staffId} onChange={(e) => setStaffId(e.target.value)} required placeholder="STAFF/2026/001" /></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="title">Academic position</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Senior Lecturer" /></div><div className="flex flex-col gap-2"><Label htmlFor="office">Office location</Label><Input id="office" value={officeLocation} onChange={(e) => setOfficeLocation(e.target.value)} placeholder="Block B, Room 14" /></div></div><div className="flex flex-col gap-2"><Label htmlFor="lecturer-bio">Short professional bio</Label><Input id="lecturer-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Teaching and research interests" /></div></div>}{signup && mode === 'student' && <><div className="flex flex-col gap-2"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="matric">Matric number</Label><Input id="matric" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} required placeholder="e.g. CSC/24/001" /></div><div className="flex flex-col gap-2"><Label htmlFor="faculty">Faculty</Label><Input id="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} required placeholder="Computing" /></div></div><div className="flex flex-col gap-2"><Label htmlFor="department">Department</Label><Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required placeholder="Computer Science" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="programme">Course / programme</Label><Input id="programme" value={programme} onChange={(e) => setProgramme(e.target.value)} required placeholder="B.Sc. Computer Science" /></div><div className="flex flex-col gap-2"><Label htmlFor="phone">Contact number</Label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="0800 000 0000" /><Label htmlFor="address">Home address</Label><Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Your residential address" /><Label htmlFor="level">Level</Label><select id="level" value={level} onChange={(e) => setLevel(e.target.value)} required className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="100">100 Level</option><option value="200">200 Level</option><option value="300">300 Level</option><option value="400">400 Level</option><option value="500">500 Level</option><option value="600">600 Level</option><option value="700">Postgraduate</option></select></div></div></>}<div className="flex flex-col gap-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@university.edu" /></div><div className="flex flex-col gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" /></div>{message && <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">{message}</p>}<Button type="submit" disabled={loading} className="w-full rounded-xl">{loading ? <Loader2 className="animate-spin" /> : signup ? <>Create {mode === 'lecturer' ? 'lecturer' : 'student'} account</> : `Sign in as ${mode}`}</Button>{!signup && <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => { setRecovery(true); setMessage('') }}>Forgot password?</Button>}</form><div className="flex items-center justify-between border-t border-border/70 pt-4"><p className="text-sm text-muted-foreground">{signup ? 'Already have an account?' : 'Need an account?'}</p><Button type="button" variant="link" className="px-0" onClick={() => { setSignup((value) => !value); setMessage('') }}>{signup ? 'Sign in instead' : 'Create an account'}</Button></div>{mode === 'student' && <Button variant="link" className="mx-auto" onClick={() => setSignup((value) => !value)}>{signup ? 'Already have a student account? Sign in' : 'New student? Create an account'}</Button>}</CardContent></Card></main>
}
