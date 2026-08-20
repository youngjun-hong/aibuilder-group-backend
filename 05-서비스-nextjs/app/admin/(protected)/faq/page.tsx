import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { listFaqItemsForAdmin } from '@/lib/data/faq'
import FaqItemRow from './FaqItemRow'

/* FAQ 관리 — Content 와 동일한 성격(브랜드 레벨 정적 정보): 승인 워크플로 없이 admin 전용 CRUD. */
export default async function AdminFaqPage() {
  await requireAdmin()
  const items = await listFaqItemsForAdmin()

  return (
    <>
      <h1>FAQ 관리</h1>
      <p className="sub">홈 미리보기·/faq 페이지에 그대로 반영됩니다</p>

      <div className="admin-toolbar">
        <span className="spacer" />
        <Link className="admin-btn admin-btn--lime" href="/admin/faq/new">+ 새 FAQ</Link>
      </div>

      <table className="admin-table">
        <thead><tr><th>주제</th><th>질문</th><th></th></tr></thead>
        <tbody>
          {items.map(i => <FaqItemRow item={i} key={i.id} />)}
          {items.length === 0 && <tr><td colSpan={3} className="empty">등록된 FAQ가 없습니다</td></tr>}
        </tbody>
      </table>
    </>
  )
}
