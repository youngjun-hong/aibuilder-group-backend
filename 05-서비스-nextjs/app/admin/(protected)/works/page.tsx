import Link from 'next/link'
import { requireActiveBuilder } from '@/lib/auth/session'
import { listWorksForAdmin } from '@/lib/data/works'
import type { ContentStatus } from '@/lib/types'
import DeleteWorkButton from './DeleteWorkButton'

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '초안',
  pending: '승인대기',
  published: '발행',
  rejected: '반려',
  archived: '보관',
}

/* A-04 — FR-A04-01: 상태 필터, 참여 빌더 표시, 빌더 로그인 시 본인 것만. */
export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const builder = await requireActiveBuilder()
  const { status, q } = await searchParams
  const rows = await listWorksForAdmin({
    builderId: builder.id,
    isAdmin: builder.role === 'admin',
    status: (status as ContentStatus) || undefined,
    q,
  })

  return (
    <>
      <h1>Work 관리</h1>
      <p className="sub">{builder.role === 'admin' ? '전체 Work' : '내가 참여한 Work'}</p>

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
        <Link className="admin-btn admin-btn--lime" href="/admin/works/new">+ 새 Work</Link>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>제목</th><th>카테고리</th><th>참여 빌더</th><th>상태</th><th>수정일</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><Link href={`/admin/works/${r.id}`}>{r.title}</Link></td>
              <td>{r.categoryName ?? '—'}</td>
              <td>{r.builderNames.length > 0 ? r.builderNames.join(', ') : '—'}</td>
              <td><span className={`admin-badge admin-badge--${r.status}`}>{STATUS_LABEL[r.status]}</span></td>
              <td>{new Date(r.updatedAt).toLocaleDateString('ko-KR')}</td>
              <td className="actions">
                {builder.role === 'admin' && <DeleteWorkButton id={r.id} title={r.title} />}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="empty">조건에 맞는 프로젝트가 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </>
  )
}
