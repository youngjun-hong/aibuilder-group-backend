import { redirect } from 'next/navigation'
import { requireActiveBuilder } from '@/lib/auth/session'
import { getInternalDashboardStats } from '@/lib/data/dashboard'
import { getGa4Overview } from '@/lib/google/ga4'
import { getSearchConsoleOverview } from '@/lib/google/searchConsole'
import {
  StatCards, FunnelChart, PublishTrendChart, PendingAgingChart, BuilderActivityChart,
  CategoryDonuts, FaqTopicChart, Ga4Section, SearchConsoleSection,
} from './DashboardCharts'

/* 사용자 요청으로 신설한 화면(원 PRD엔 없음, app/admin/(protected)/layout.tsx 주석 참고).
   빌더 계정은 여기서 볼 게 없으므로 기존 로그인 후 착지점(A-02)으로 조용히 돌려보낸다 —
   requireAdmin() 을 쓰면 예외가 던져져 에러 화면이 뜨므로 그 대신 직접 분기한다. */
export default async function AdminDashboardPage() {
  const builder = await requireActiveBuilder()
  if (builder.role !== 'admin') redirect('/admin/insights')

  const [stats, ga4, gsc] = await Promise.all([
    getInternalDashboardStats(),
    getGa4Overview(),
    getSearchConsoleOverview(),
  ])

  return (
    <>
      <h1>대시보드</h1>
      <p className="sub">콘텐츠 운영 현황과 실측 트래픽을 한눈에 봅니다.</p>

      <StatCards stats={stats} />

      <div className="admin-dash-grid">
        <FunnelChart stats={stats} />
        <PublishTrendChart stats={stats} />
        <PendingAgingChart stats={stats} />
        <BuilderActivityChart stats={stats} />
        <CategoryDonuts stats={stats} />
        <FaqTopicChart stats={stats} />
      </div>

      <h2 className="admin-section-h">GA4 실트래픽</h2>
      <div className="admin-dash-grid">
        <Ga4Section ga4={ga4} />
      </div>

      <h2 className="admin-section-h">구글 서치콘솔</h2>
      <div className="admin-dash-grid">
        <SearchConsoleSection gsc={gsc} />
      </div>
    </>
  )
}
