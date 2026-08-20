'use client'

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { InternalDashboardStats } from '@/lib/data/dashboard'
import type { Ga4Overview } from '@/lib/google/ga4'
import type { SearchConsoleOverview } from '@/lib/google/searchConsole'

/* 공개 웹에 빨강 계열이 전혀 없어(admin.css 상태 배지와 같은 이유) 그래프 팔레트도
   라임·잉크·중립 톤만 쓴다. app/style.css 의 --lime/--ink/--muted 와 같은 값을 하드코딩 —
   Recharts 는 SVG fill 에 CSS var() 를 안정적으로 못 먹는 경우가 있어 값 자체를 박는다. */
const LIME = '#D8FF3D'
const INK = '#0E0E0C'
const INK2 = '#2A2A22'
const MUTED = '#807E74'
const LINE_C = '#DEDCD0'
const PIE_COLORS = ['#D8FF3D', '#0E0E0C', '#8BA83D', '#4A4A3E', '#C7C5B9', '#B2C947', '#2A2A22', '#66655C']

const tickStyle = { fontSize: 11, fontFamily: 'var(--mono)', fill: MUTED }
const tooltipStyle = {
  border: `1px solid ${LINE_C}`, borderRadius: 12, fontSize: 12.5, fontFamily: 'var(--sans)',
  background: '#fff', boxShadow: '0 8px 24px rgba(14,14,12,.12)',
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="admin-chart-panel">
      <h3>{title}</h3>
      {sub && <p className="sub">{sub}</p>}
      {children}
    </div>
  )
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="admin-empty-card">
      <b>{label} — 연동 필요</b>
      저장소의 <code>docs/analytics-seo-setup.md</code> 가이드를 따라 자격증명을 넣으면 여기에 실측 그래프가 뜹니다.
    </div>
  )
}

export function StatCards({ stats }: { stats: InternalDashboardStats }) {
  const items = [
    { label: 'Work 전체', value: stats.totals.works },
    { label: 'Insight 전체', value: stats.totals.insights },
    { label: '승인 대기', value: stats.totals.pending },
    { label: '영상 · 활성', value: stats.content.videos.active, hint: `/ ${stats.content.videos.active + stats.content.videos.inactive}` },
    { label: 'FAQ · 활성', value: stats.content.faq.active, hint: `/ ${stats.content.faq.active + stats.content.faq.inactive}` },
  ]
  return (
    <div className="admin-stat-grid">
      {items.map(it => (
        <div className="admin-stat" key={it.label}>
          <p className="admin-stat__label">{it.label}</p>
          <div className="admin-stat__num">{it.value}{it.hint && <small>{it.hint}</small>}</div>
        </div>
      ))}
    </div>
  )
}

export function FunnelChart({ stats }: { stats: InternalDashboardStats }) {
  const data = stats.funnel.works.map((w, i) => ({
    status: w.status,
    Work: w.count,
    Insight: stats.funnel.insights[i]?.count ?? 0,
  }))
  return (
    <Panel title="상태 퍼널" sub="Work · Insight 각 상태별 건수">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid stroke={LINE_C} vertical={false} />
          <XAxis dataKey="status" tick={tickStyle} axisLine={{ stroke: LINE_C }} tickLine={false} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Work" fill={INK} radius={[6, 6, 0, 0]} />
          <Bar dataKey="Insight" fill={LIME} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function PublishTrendChart({ stats }: { stats: InternalDashboardStats }) {
  return (
    <Panel title="발행 추이" sub="최근 12주, 주 시작일 기준">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={stats.publishTrend} margin={{ left: -20 }}>
          <CartesianGrid stroke={LINE_C} vertical={false} />
          <XAxis dataKey="weekLabel" tick={tickStyle} axisLine={{ stroke: LINE_C }} tickLine={false} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="works" name="Work" stroke={INK} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="insights" name="Insight" stroke={LIME} strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function PendingAgingChart({ stats }: { stats: InternalDashboardStats }) {
  return (
    <Panel title="승인대기 에이징" sub="제출 후 경과일 분포 — 오래 묵을수록 오른쪽">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={stats.pendingAging} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke={LINE_C} horizontal={false} />
          <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} width={50} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill={INK2} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function BuilderActivityChart({ stats }: { stats: InternalDashboardStats }) {
  if (stats.builderActivity.length === 0) return <Panel title="빌더별 활동량"><p className="sub">아직 데이터가 없습니다.</p></Panel>
  return (
    <Panel title="빌더별 활동량" sub="Work + Insight 작성 건수 상위">
      <ResponsiveContainer width="100%" height={Math.max(160, stats.builderActivity.length * 34)}>
        <BarChart data={stats.builderActivity} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke={LINE_C} horizontal={false} />
          <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} width={80} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill={LIME} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

function MiniDonut({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) return <p className="sub">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function CategoryDonuts({ stats }: { stats: InternalDashboardStats }) {
  return (
    <>
      <Panel title="Work 카테고리 분포"><MiniDonut data={stats.categoryDistribution.works} /></Panel>
      <Panel title="Insight 카테고리 분포"><MiniDonut data={stats.categoryDistribution.insights} /></Panel>
    </>
  )
}

export function FaqTopicChart({ stats }: { stats: InternalDashboardStats }) {
  if (stats.content.faq.byTopic.length === 0) return null
  return (
    <Panel title="FAQ 주제별 건수">
      <ResponsiveContainer width="100%" height={Math.max(140, stats.content.faq.byTopic.length * 30)}>
        <BarChart data={stats.content.faq.byTopic} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke={LINE_C} horizontal={false} />
          <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} width={90} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill={MUTED} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function Ga4Section({ ga4 }: { ga4: Ga4Overview }) {
  if (!ga4.configured) return <EmptyCard label="GA4 실트래픽" />
  return (
    <>
      <Panel title="세션 · 사용자 · 조회수" sub="최근 28일">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={ga4.daily} margin={{ left: -20 }}>
            <CartesianGrid stroke={LINE_C} vertical={false} />
            <XAxis dataKey="date" tick={tickStyle} axisLine={{ stroke: LINE_C }} tickLine={false} interval={3} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="sessions" name="세션" stroke={INK} fill={INK} fillOpacity={0.08} strokeWidth={2} />
            <Area type="monotone" dataKey="users" name="사용자" stroke={MUTED} fill={MUTED} fillOpacity={0.06} strokeWidth={1.5} />
            <Area type="monotone" dataKey="pageviews" name="조회수" stroke={LIME} fill={LIME} fillOpacity={0.25} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="유입 채널 비중" sub="최근 28일 세션 기준"><MiniDonut data={ga4.channels.map(c => ({ name: c.name, count: c.sessions }))} /></Panel>
      <Panel title="기기 비중" sub="최근 28일 세션 기준"><MiniDonut data={ga4.devices.map(d => ({ name: d.name, count: d.sessions }))} /></Panel>
      <Panel title="인기 페이지 Top 10" sub="최근 28일 조회수 기준">
        <table className="admin-table">
          <thead><tr><th>경로</th><th>조회수</th></tr></thead>
          <tbody>
            {ga4.topPages.map(p => <tr key={p.path}><td>{p.path}</td><td>{p.pageviews.toLocaleString()}</td></tr>)}
            {ga4.topPages.length === 0 && <tr><td colSpan={2} className="empty">데이터 없음</td></tr>}
          </tbody>
        </table>
      </Panel>
    </>
  )
}

export function SearchConsoleSection({ gsc }: { gsc: SearchConsoleOverview }) {
  if (!gsc.configured) return <EmptyCard label="구글 서치콘솔" />
  return (
    <>
      <div className="admin-stat-grid" style={{ marginBottom: 0 }}>
        <div className="admin-stat">
          <p className="admin-stat__label">평균 CTR</p>
          <div className="admin-stat__num">{(gsc.avgCtr * 100).toFixed(1)}<small>%</small></div>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">평균 노출 순위</p>
          <div className="admin-stat__num">{gsc.avgPosition.toFixed(1)}</div>
        </div>
      </div>
      <Panel title="클릭 · 노출 추이" sub="최근 28일">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={gsc.daily} margin={{ left: -20 }}>
            <CartesianGrid stroke={LINE_C} vertical={false} />
            <XAxis dataKey="date" tick={tickStyle} axisLine={{ stroke: LINE_C }} tickLine={false} interval={3} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="clicks" name="클릭" stroke={INK} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="impressions" name="노출" stroke={LIME} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="인기 검색어 Top 10" sub="최근 28일">
        <table className="admin-table">
          <thead><tr><th>검색어</th><th>클릭</th><th>노출</th><th>CTR</th><th>평균 순위</th></tr></thead>
          <tbody>
            {gsc.topQueries.map(q => (
              <tr key={q.key}>
                <td>{q.key}</td><td>{q.clicks}</td><td>{q.impressions}</td>
                <td>{(q.ctr * 100).toFixed(1)}%</td><td>{q.position.toFixed(1)}</td>
              </tr>
            ))}
            {gsc.topQueries.length === 0 && <tr><td colSpan={5} className="empty">데이터 없음</td></tr>}
          </tbody>
        </table>
      </Panel>
      <Panel title="인기 페이지 Top 10" sub="최근 28일">
        <table className="admin-table">
          <thead><tr><th>페이지</th><th>클릭</th><th>노출</th><th>CTR</th><th>평균 순위</th></tr></thead>
          <tbody>
            {gsc.topPages.map(p => (
              <tr key={p.key}>
                <td>{p.key}</td><td>{p.clicks}</td><td>{p.impressions}</td>
                <td>{(p.ctr * 100).toFixed(1)}%</td><td>{p.position.toFixed(1)}</td>
              </tr>
            ))}
            {gsc.topPages.length === 0 && <tr><td colSpan={5} className="empty">데이터 없음</td></tr>}
          </tbody>
        </table>
      </Panel>
    </>
  )
}
