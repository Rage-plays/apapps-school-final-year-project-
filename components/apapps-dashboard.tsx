'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardPlus,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const students = [
  { id: 'AP-2048', name: 'Amara Okafor', course: 'Computer Science', year: '400 Level', attendance: 92, ca: 84, exam: 88, risk: 'Low', initials: 'AO', trend: [62, 68, 72, 78, 84, 88] },
  { id: 'AP-2091', name: 'Daniel Mensah', course: 'Information Systems', year: '300 Level', attendance: 78, ca: 68, exam: 71, risk: 'Medium', initials: 'DM', trend: [78, 76, 74, 71, 70, 71] },
  { id: 'AP-2114', name: 'Kemi Adeyemi', course: 'Computer Science', year: '200 Level', attendance: 61, ca: 52, exam: 48, risk: 'High', initials: 'KA', trend: [68, 63, 59, 55, 50, 48] },
  { id: 'AP-1987', name: 'Ibrahim Bello', course: 'Software Engineering', year: '400 Level', attendance: 86, ca: 76, exam: 79, risk: 'Low', initials: 'IB', trend: [65, 69, 70, 73, 77, 79] },
  { id: 'AP-2203', name: 'Zainab Yusuf', course: 'Information Systems', year: '100 Level', attendance: 69, ca: 63, exam: 58, risk: 'Medium', initials: 'ZY', trend: [71, 67, 68, 63, 60, 58] },
  { id: 'AP-1944', name: 'Chinedu Eze', course: 'Cybersecurity', year: '300 Level', attendance: 54, ca: 47, exam: 42, risk: 'High', initials: 'CE', trend: [59, 56, 52, 48, 45, 42] },
  { id: 'AP-2168', name: 'Fatima Garba', course: 'Computer Science', year: '200 Level', attendance: 89, ca: 79, exam: 83, risk: 'Low', initials: 'FG', trend: [70, 73, 76, 78, 81, 83] },
  { id: 'AP-2077', name: 'Samuel Adebayo', course: 'Software Engineering', year: '300 Level', attendance: 73, ca: 60, exam: 64, risk: 'Medium', initials: 'SA', trend: [74, 73, 69, 67, 65, 64] },
]

const trendData = [
  { month: 'Jan', score: 68, attendance: 76 },
  { month: 'Feb', score: 71, attendance: 78 },
  { month: 'Mar', score: 70, attendance: 74 },
  { month: 'Apr', score: 76, attendance: 81 },
  { month: 'May', score: 79, attendance: 83 },
  { month: 'Jun', score: 82, attendance: 86 },
]

const courseData = [
  { name: 'Comp. Sci.', performance: 78 },
  { name: 'Info. Sys.', performance: 70 },
  { name: 'Soft. Eng.', performance: 74 },
  { name: 'Cybersec.', performance: 62 },
]

const riskData = [
  { name: 'Low risk', value: 58, color: 'var(--chart-1)' },
  { name: 'Medium risk', value: 27, color: 'var(--chart-2)' },
  { name: 'High risk', value: 15, color: 'var(--chart-3)' },
]

const riskStyles = {
  Low: 'border-success/20 bg-success/10 text-success',
  Medium: 'border-warning/20 bg-warning/10 text-warning',
  High: 'border-danger/20 bg-danger/10 text-danger',
}

function RiskBadge({ risk }: { risk: string }) {
  return <Badge variant="outline" className={riskStyles[risk as keyof typeof riskStyles]}>{risk} risk</Badge>
}

function StatCard({ icon: Icon, label, value, detail, tone = 'teal' }: { icon: typeof Users; label: string; value: string; detail: string; tone?: string }) {
  return (
    <Card className="border-border/70 bg-card/85 shadow-sm transition-transform hover:-translate-y-0.5">
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl bg-${tone}/10 text-${tone}`}><Icon /></div>
      </CardContent>
    </Card>
  )
}

export default function APAPPSDashboard() {
  const [active, setActive] = useState('Overview')
  const [studentMode, setStudentMode] = useState(false)
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [selected, setSelected] = useState<typeof students[number] | null>(null)
  const [notes, setNotes] = useState<string[]>(['Discussed attendance recovery plan and paired student with a peer study group.'])
  const [note, setNote] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesQuery = `${student.name} ${student.id} ${student.course}`.toLowerCase().includes(query.toLowerCase())
    const matchesRisk = riskFilter === 'All' || student.risk === riskFilter
    return matchesQuery && matchesRisk
  }), [query, riskFilter])

  function addNote() {
    if (!note.trim()) return
    setNotes((current) => [note.trim(), ...current])
    setNote('')
  }

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Students', icon: Users },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 transition-transform lg:static lg:translate-x-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><ShieldCheck /></div><div><p className="font-mono text-lg font-semibold tracking-tight">APAPPS</p><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Academic intelligence</p></div></div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X /></Button>
          </div>
          <div className="mt-10 flex flex-col gap-2">
            <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
            {navItems.map(({ label, icon: Icon }) => <Button key={label} variant={active === label ? 'secondary' : 'ghost'} className="justify-start gap-3 rounded-xl px-3" onClick={() => { setActive(label); setSidebarOpen(false) }}><Icon data-icon="inline-start" />{label}{label === 'Students' && <Badge variant="secondary" className="ml-auto">8</Badge>}</Button>)}
          </div>
          <div className="mt-auto flex flex-col gap-4">
            <Card className="border-primary/15 bg-primary/5"><CardContent className="flex flex-col gap-3 p-4"><Sparkles className="text-primary" /><p className="text-sm font-medium">Prediction engine online</p><p className="text-xs leading-5 text-muted-foreground">Risk scores refresh after every academic record update.</p><Badge variant="outline" className="w-fit border-success/20 bg-success/10 text-success">● Live model</Badge></CardContent></Card>
            <div className="flex items-center gap-3 rounded-xl border border-sidebar-border p-3"><div className="flex size-9 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">JO</div><div className="min-w-0"><p className="truncate text-sm font-medium">Dr. James Osei</p><p className="truncate text-xs text-muted-foreground">Lecturer · CS Dept.</p></div><MoreHorizontal className="ml-auto text-muted-foreground" /></div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl lg:px-10">
            <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu /></Button><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">{studentMode ? 'Student portal' : 'Lecturer workspace'}</p><h1 className="text-xl font-semibold tracking-tight">{studentMode ? 'Welcome back, Amara' : active}</h1></div></div>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="hidden gap-2 rounded-xl sm:flex" onClick={() => setStudentMode((mode) => !mode)}><UserRound />{studentMode ? 'Lecturer view' : 'Student view'}</Button><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">JO</div></div>
          </header>

          {studentMode ? <StudentView /> : <div className="mx-auto flex max-w-[1500px] flex-col gap-8 p-5 lg:p-10">
            <section className="flex flex-col justify-between gap-5 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm lg:flex-row lg:items-end lg:p-8"><div className="flex max-w-2xl flex-col gap-3"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary"><Activity /> Monday, 18 August 2026</div><h2 className="max-w-xl text-pretty text-3xl font-semibold tracking-tight lg:text-5xl">See who needs support, before they fall behind.</h2><p className="max-w-xl text-sm leading-6 text-muted-foreground lg:text-base">APAPPS turns academic signals into clear next steps for every student in your classroom.</p></div><Button className="w-fit rounded-xl" onClick={() => setActive('Students')}><ClipboardPlus data-icon="inline-start" />Review students<ArrowUpRight data-icon="inline-end" /></Button></section>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Users} label="Total students" value="128" detail="Across 4 active courses" /><StatCard icon={AlertTriangle} label="Need attention" value="19" detail="4 fewer than last month" tone="warning" /><StatCard icon={TrendingUp} label="Avg. performance" value="74.8%" detail="↑ 6.2% this semester" tone="primary" /><StatCard icon={Target} label="Interventions" value="31" detail="12 resolved this month" tone="accent" /></section>
            <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]"><Card className="min-w-0"><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Performance pulse</CardTitle><CardDescription>Class average across the current semester</CardDescription></div><Badge variant="outline" className="border-success/20 bg-success/10 text-success">+6.2% trend</Badge></CardHeader><CardContent><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ left: -15, right: 5, top: 10 }}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} /><stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--popover-foreground)' }} /><Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={3} fill="url(#scoreFill)" /></AreaChart></ResponsiveContainer></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Risk overview</CardTitle><CardDescription>Current prediction distribution</CardDescription></CardHeader><CardContent><div className="relative h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={riskData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={78} paddingAngle={4} stroke="none">{riskData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12 }} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="font-mono text-2xl font-semibold">128</span><span className="text-xs text-muted-foreground">students</span></div></div><div className="flex flex-col gap-3">{riskData.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-mono text-muted-foreground">{item.value}%</span></div>)}</div></CardContent></Card></section>
            <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]"><Card className="min-w-0"><CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><CardTitle>Students requiring attention</CardTitle><CardDescription>Prioritized by the APAPPS prediction engine</CardDescription></div><Button variant="ghost" size="sm" onClick={() => setActive('Students')}>View all <ChevronRight data-icon="inline-end" /></Button></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students..." className="rounded-xl pl-9" /></div><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} aria-label="Filter by risk" className="h-10 rounded-xl border border-input bg-background px-3 text-sm"><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="pb-3 font-medium">Student</th><th className="pb-3 font-medium">Course</th><th className="pb-3 font-medium">Attendance</th><th className="pb-3 font-medium">Avg. score</th><th className="pb-3 font-medium">Risk</th><th className="pb-3" /></tr></thead><tbody>{filteredStudents.slice(0, 5).map((student) => <tr key={student.id} className="border-b border-border/60 last:border-0"><td className="py-4"><button className="flex items-center gap-3 text-left" onClick={() => setSelected(student)}><span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{student.initials}</span><span><span className="block font-medium">{student.name}</span><span className="block text-xs text-muted-foreground">{student.id}</span></span></button></td><td className="py-4 text-muted-foreground">{student.course}</td><td className="py-4 font-mono">{student.attendance}%</td><td className="py-4 font-mono">{Math.round((student.ca + student.exam) / 2)}%</td><td className="py-4"><RiskBadge risk={student.risk} /></td><td className="py-4 text-right"><Button variant="ghost" size="icon" aria-label={`Open ${student.name}`} onClick={() => setSelected(student)}><ChevronRight /></Button></td></tr>)}</tbody></table></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Recent interventions</CardTitle><CardDescription>Small actions, meaningful momentum</CardDescription></CardHeader><CardContent className="flex flex-col gap-5">{['Amara Okafor', 'Kemi Adeyemi', 'Daniel Mensah'].map((name, index) => <div key={name} className="flex gap-3"><div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"><CheckCircle2 /></div><div className="min-w-0"><p className="text-sm font-medium">{index === 0 ? 'Study group assigned' : index === 1 ? 'Advisor meeting logged' : 'Attendance plan created'}</p><p className="truncate text-xs text-muted-foreground">{name} · {index + 1}d ago</p></div></div>)}<Separator /><Button variant="outline" className="rounded-xl" onClick={() => setSelected(students[0])}><MessageSquareText data-icon="inline-start" />Log an intervention</Button></CardContent></Card></section>
          </div>}
        </main>
      </div>
      {selected && <div className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setSelected(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex size-12 items-center justify-center rounded-2xl bg-accent font-semibold text-accent-foreground">{selected.initials}</div><div><p className="text-xl font-semibold">{selected.name}</p><p className="text-sm text-muted-foreground">{selected.id} · {selected.course}</p></div></div><Button variant="ghost" size="icon" onClick={() => setSelected(null)} aria-label="Close student details"><X /></Button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Attendance</p><p className="mt-1 font-mono text-2xl font-semibold">{selected.attendance}%</p></div><div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">CA score</p><p className="mt-1 font-mono text-2xl font-semibold">{selected.ca}%</p></div><div className="rounded-2xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Prediction</p><div className="mt-2"><RiskBadge risk={selected.risk} /></div></div></div><div className="mt-6 flex flex-col gap-3"><div className="flex items-center justify-between"><div><p className="font-semibold">Performance trend</p><p className="text-xs text-muted-foreground">Last six assessment checkpoints</p></div><TrendingUp className="text-primary" /></div><div className="h-44"><ResponsiveContainer width="100%" height="100%"><AreaChart data={selected.trend.map((score, index) => ({ period: `P${index + 1}`, score }))}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" /><XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis domain={[30, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Area type="monotone" dataKey="score" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={3} /></AreaChart></ResponsiveContainer></div></div><div className="mt-4 rounded-2xl border border-warning/20 bg-warning/5 p-4"><p className="flex items-center gap-2 text-sm font-medium text-warning"><Sparkles /> Prediction explanation</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.risk === 'High' ? 'Low attendance and declining CA scores are the strongest contributing factors.' : selected.risk === 'Medium' ? 'Recent assessment performance is flattening. A check-in could protect momentum.' : 'Consistent attendance and improving assessment scores suggest a healthy trajectory.'}</p></div><div className="mt-6 flex flex-col gap-3"><p className="font-semibold">Intervention notes</p>{notes.map((item, index) => <div key={`${item}-${index}`} className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">{item}</div>)}<div className="flex gap-2"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note about the next step..." onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) addNote() }} /><Button onClick={addNote} aria-label="Add intervention note"><Plus /></Button></div></div></div></div>}
    </div>
  )
}

function StudentView() {
  return <div className="mx-auto flex max-w-5xl flex-col gap-8 p-5 lg:p-10"><section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-6 lg:p-8"><div className="flex max-w-2xl flex-col gap-3"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary"><GraduationCap /> Your learning snapshot</div><h2 className="text-pretty text-3xl font-semibold tracking-tight lg:text-5xl">You are building strong momentum.</h2><p className="text-sm leading-6 text-muted-foreground lg:text-base">Your latest signals point to a healthy academic trajectory. Keep showing up and use the next steps below to stay on track.</p></div></section><section className="grid gap-4 sm:grid-cols-3"><StatCard icon={TrendingUp} label="Overall average" value="86%" detail="↑ 4.8% from last month" tone="primary" /><StatCard icon={CheckCircle2} label="Attendance" value="92%" detail="Excellent consistency" tone="teal" /><StatCard icon={ShieldCheck} label="Predicted risk" value="Low" detail="You are on track" tone="accent" /></section><section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><Card><CardHeader><CardTitle>Your performance trend</CardTitle><CardDescription>Assessment average across the semester</CardDescription></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Area type="monotone" dataKey="score" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={3} /></AreaChart></ResponsiveContainer></div></CardContent></Card><Card><CardHeader><CardTitle>Suggested next steps</CardTitle><CardDescription>Personalized for your current progress</CardDescription></CardHeader><CardContent className="flex flex-col gap-4">{['Keep your attendance above 85%', 'Review the next CA study guide', 'Book a feedback session'].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 text-sm"><CheckCircle2 className="text-success" />{item}</div>)}</CardContent></Card></section></div>
}

function _UnusedChart({ data }: { data: { name: string; performance: number }[] }) {
  return <BarChart data={data}><Bar dataKey="performance" /></BarChart>
}
