import { generateText, gateway } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const metrics = body?.metrics
    if (!metrics || typeof metrics !== 'object') return NextResponse.json({ error: 'Academic metrics are required.' }, { status: 400 })

    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json({ source: 'fallback', recommendation: fallbackRecommendation(metrics) })
    }

    const { text } = await generateText({
      model: gateway('openai/gpt-5-mini'),
      system: 'You are APAPPS, an assistive academic support analyst. Never make final academic decisions. Give concise, practical interventions grounded only in the supplied metrics. Return plain text with: risk signal, rationale, and next action.',
      prompt: `Analyze these authorized aggregate academic metrics and recommend a supportive intervention:\n${JSON.stringify(metrics)}`,
      temperature: 0.2,
    })
    return NextResponse.json({ source: 'ai-gateway', recommendation: text })
  } catch {
    return NextResponse.json({ source: 'fallback', recommendation: fallbackRecommendation({}) })
  }
}

function fallbackRecommendation(metrics: Record<string, number>) {
  const attendance = Number(metrics.attendance ?? 0)
  const assignments = Number(metrics.assignments ?? 0)
  const examinations = Number(metrics.examinations ?? 0)
  if (attendance < 60) return 'Risk signal: attendance is the strongest concern. Rationale: missed learning time may be affecting assessment readiness. Next action: schedule a private check-in and agree on an attendance recovery plan.'
  if (examinations < 55) return 'Risk signal: examination performance is declining. Rationale: assessment mastery is below the support threshold. Next action: offer a targeted revision session and review the last two missed concepts.'
  if (assignments < 60) return 'Risk signal: assignment completion is low. Rationale: unfinished practice reduces feedback opportunities. Next action: break the next submission into milestones and provide an early progress check.'
  return 'Risk signal: no urgent single-factor alert. Rationale: the available signals are broadly stable. Next action: continue regular monitoring and reinforce the student’s strongest learning habit.'
}
