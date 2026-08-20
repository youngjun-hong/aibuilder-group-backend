import Link from 'next/link'
import { requireActiveBuilder } from '@/lib/auth/session'
import { listInsightsForAdmin } from '@/lib/data/insights'
import type { ContentStatus } from '@/lib/types'
import DeleteInsightButton from './DeleteInsightButton'

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '초안',
  pending: '승인대기',
  published: '발행',
  rejected: '반려',
  archived: '보관',
}

/* A-02 — FR-A02-01: 상태 필터·검색, 빌더 로그인 시 본인 글만. */
export default async function AdminInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const builder = await requireActiveBuilder()
  const { status, q } = await searchParams
  const rows = await listInsightsForAdmin({
    builderId: builder.id,
    isAdmin: builder.role === 'admin',
    status: (status as ContentStatus) || undefined,
    q,
  })

  return (
    <>
      <h1>Insight 관리</h1>
      <p className="sub">{builder.role === 'admin' ? '전체 Insight' : '내가 작성한 Insight'}</p>

      <form className="admin-toolbar" method="get">
        <select name="status" defaultValue={status ?? ''}>
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input type="search" name="q" placeholder="제목 검색" defaultValue={q ?? ''} />
        <button className="admin-btn admin-btn--ghost" type="submit">검색</button>
        <span className="spacer" />
        <Link className="admin-btn admin-btn--lime" href="/admin/insights/new">+ 새 Insight</Link>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>제목</th><th>카테고리</th><th>작성자</th><th>상태</th><th>수정일</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><Link href={`/admin/insights/${r.id}`}>{r.title}</Link></td>
              <td>{r.categoryName ?? '—'}</td>
              <td>{r.authorName ?? '—'}</td>
              <td><span className={`admin-badge admin-badge--${r.status}`}>{STATUS_LABEL[r.status]}</span></td>
              <td>{new Date(r.updatedAt).toLocaleDateString('ko-KR')}</td>
              <td className="actions">
                {builder.role === 'admin' && <DeleteInsightButton id={r.id} title={r.title} />}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="empty">조건에 맞는 글이 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </>
  )
}
