import { getGoogleAccessToken } from './auth'

const SITE_URL = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? ''

export type GscDailyPoint = { date: string; clicks: number; impressions: number }
export type GscRow = { key: string; clicks: number; impressions: number; ctr: number; position: number }
export type SearchConsoleOverview =
  | { configured: false }
  | {
      configured: true
      daily: GscDailyPoint[]
      avgCtr: number
      avgPosition: number
      topQueries: GscRow[]
      topPages: GscRow[]
    }

async function query(token: string, body: unknown) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 3600 }, // 쿼터 보호 — 1시간 캐시
    },
  )
  if (!res.ok) throw new Error(`Search Console API ${res.status}: ${await res.text()}`)
  return res.json()
}

function last28Days() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 28)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: fmt(start), endDate: fmt(end) }
}

function toRow(r: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }): GscRow {
  return { key: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }
}

/** 최근 28일 클릭·노출 추이, 평균 CTR·평균 순위, 인기 검색어·인기 페이지 Top 10.
 *  GOOGLE_SEARCH_CONSOLE_SITE_URL·GOOGLE_SERVICE_ACCOUNT_KEY 중 하나라도 없거나 API 호출이
 *  실패하면 { configured: false } — 대시보드는 이걸 "연동 필요" 카드로 보여주고 죽지 않는다. */
export async function getSearchConsoleOverview(): Promise<SearchConsoleOverview> {
  if (!SITE_URL) return { configured: false }
  const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/webmasters.readonly'])
  if (!token) return { configured: false }

  try {
    const range = last28Days()
    const [dailyRes, queryRes, pageRes] = await Promise.all([
      query(token, { ...range, dimensions: ['date'] }),
      query(token, { ...range, dimensions: ['query'], rowLimit: 10 }),
      query(token, { ...range, dimensions: ['page'], rowLimit: 10 }),
    ])

    const dailyRows: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] =
      dailyRes.rows ?? []
    const daily: GscDailyPoint[] = dailyRows.map(r => ({
      date: `${Number(r.keys[0].slice(5, 7))}/${Number(r.keys[0].slice(8, 10))}`,
      clicks: r.clicks,
      impressions: r.impressions,
    }))
    const totalClicks = daily.reduce((s, d) => s + d.clicks, 0)
    const totalImpressions = daily.reduce((s, d) => s + d.impressions, 0)
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const avgPosition = dailyRows.length > 0 ? dailyRows.reduce((s, r) => s + r.position, 0) / dailyRows.length : 0

    return {
      configured: true,
      daily,
      avgCtr,
      avgPosition,
      topQueries: (queryRes.rows ?? []).map(toRow),
      topPages: (pageRes.rows ?? []).map(toRow),
    }
  } catch (e) {
    // console.error 를 쓰면 Next dev 오버레이가 "정상적으로 연동 필요 카드로 대체된" 상태를
    // 마치 페이지가 깨진 것처럼 빨간 풀스크린 에러로 보여준다 — warn 이면 로그는 남되 안 뜬다.
    console.warn('[search-console] 리포트 조회 실패(연동 미완료로 처리)', e)
    return { configured: false }
  }
}
