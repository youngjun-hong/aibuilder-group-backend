import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { ApproveButton, RejectApprovalButton } from './ApprovalActions'

/* A-07 — FR-A07-01: Work·Insight pending 을 한 목록에서, 타입 배지로 구분.
   FR-A07-05 는 middleware.ts(proxy.ts) 가 이미 이 경로 전체를 admin 아닌 role 에 403 처리한다 —
   requireAdmin() 은 그 위의 2차 방어선. */
export default async function ApprovalsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [{ data: works }, { data: insights }] = await Promise.all([
    supabase
      .from('works')
      .select('id, slug, title, updated_at, author:builders!works_created_by_fkey(name)')
      .eq('status', 'pending'),
    supabase
      .from('insights')
      .select('id, slug, title, updated_at, author:builders!insights_author_id_fkey(name)')
      .eq('status', 'pending'),
  ])

  type Row = { type: 'work' | 'insight'; id: string; slug: string; title: string; updatedAt: string; authorName: string | null }
  const rows: Row[] = [
    ...(works ?? []).map(w => ({ type: 'work' as const, id: w.id, slug: w.slug, title: w.title, updatedAt: w.updated_at, authorName: (w.author as any)?.name ?? null })),
    ...(insights ?? []).map(a => ({ type: 'insight' as const, id: a.id, slug: a.slug, title: a.title, updatedAt: a.updated_at, authorName: (a.author as any)?.name ?? null })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <>
      <h1>승인 대기</h1>
      <p className="sub">Work·Insight 통합 승인 대기열</p>

      <table className="admin-table">
        <thead>
          <tr><th>타입</th><th>제목</th><th>작성자</th><th>제출일</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={`${r.type}-${r.id}`}>
              <td><span className="admin-type-badge">{r.type === 'work' ? 'Work' : 'Insight'}</span></td>
              <td>
                <Link href={`/admin/preview/${r.type}/${r.id}`} target="_blank">{r.title}</Link>
                {' · '}
                <Link href={`/admin/${r.type}s/${r.id}`} style={{ fontSize: 12, fontWeight: 400 }}>편집</Link>
              </td>
              <td>{r.authorName ?? '—'}</td>
              <td>{new Date(r.updatedAt).toLocaleDateString('ko-KR')}</td>
              <td className="actions">
                <ApproveButton type={r.type} id={r.id} title={r.title} />
                <RejectApprovalButton type={r.type} id={r.id} />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="empty">승인 대기 중인 콘텐츠가 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </>
  )
}
