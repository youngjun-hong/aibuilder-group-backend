import { getGoogleAccessToken } from './auth'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? ''

export type Ga4DailyPoint = { date: string; sessions: number; users: number; pageviews: number }
export type Ga4Overview =
  | { configured: false }
  | {
      configured: true
      daily: Ga4DailyPoint[]
      channels: { name: string; sessions: number }[]
      devices: { name: string; sessions: number }[]
      topPages: { path: string; pageviews: number }[]
    }

async function runReport(token: string, body: unknown) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    next: { revalidate: 3600 }, // 쿼터 보호 — 1시간 캐시
  })
  if (!res.ok) throw new Error(`GA4 Data API ${res.status}: ${await res.text()}`)
  return res.json()
}

/** GA4 는 date 를 YYYYMMDD 로 준다 */
function formatDate(v: string): string {
  return `${Number(v.slice(4, 6))}/${Number(v.slice(6, 8))}`
}

/** 최근 28일 세션/사용자/조회수 추이, 유입 채널·기기 비중, 인기 페이지 Top 10.
 *  GA4_PROPERTY_ID·GOOGLE_SERVICE_ACCOUNT_KEY 중 하나라도 없거나 API 호출이 실패하면
 *  { configured: false } — 대시보드는 이걸 "연동 필요" 카드로 보여주고 죽지 않는다. */
export async function getGa4Overview(): Promise<Ga4Overview> {
  if (!PROPERTY_ID) return { configured: false }
  const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/analytics.readonly'])
  if (!token) return { configured: false }

  try {
    const [dailyRes, channelRes, deviceRes, pagesRes] = await Promise.all([
      runReport(token, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      runReport(token, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
      }),
      runReport(token, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      }),
      runReport(token, {
        dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
    ])

    const daily: Ga4DailyPoint[] = (dailyRes.rows ?? []).map((r: any) => ({
      date: formatDate(r.dimensionValues[0].value),
      sessions: Number(r.metricValues[0].value),
      users: Number(r.metricValues[1].value),
      pageviews: Number(r.metricValues[2].value),
    }))
    const channels = (channelRes.rows ?? []).map((r: any) => ({
      name: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
    }))
    const devices = (deviceRes.rows ?? []).map((r: any) => ({
      name: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
    }))
    const topPages = (pagesRes.rows ?? []).map((r: any) => ({
      path: r.dimensionValues[0].value,
      pageviews: Number(r.metricValues[0].value),
    }))

    return { configured: true, daily, channels, devices, topPages }
  } catch (e) {
    console.error('[ga4] 리포트 조회 실패', e)
    return { configured: false }
  }
}
