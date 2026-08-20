'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { toggleFaqItemActive, deleteFaqItem } from './actions'
import type { AdminFaqItem } from '@/lib/data/faq'

export default function FaqItemRow({ item }: { item: AdminFaqItem }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <tr>
      <td>{item.topicLabel}</td>
      <td>
        <Link href={`/admin/faq/${item.id}`}>{item.question}</Link>
        {!item.isActive && <span className="admin-badge admin-badge--archived" style={{ marginLeft: 8 }}>비활성</span>}
        {item.showOnHome && <span className="admin-badge admin-badge--published" style={{ marginLeft: 8 }}>홈 노출</span>}
      </td>
      <td className="actions">
        <Link className="admin-btn admin-btn--ghost" href={`/admin/faq/${item.id}`}>수정</Link>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={pending}
          onClick={() => startTransition(async () => { await toggleFaqItemActive(item.id, !item.isActive); router.refresh() })}
        >
          {item.isActive ? '비활성화' : '활성화'}
        </button>
        <ConfirmButton
          label="삭제"
          title="FAQ 삭제"
          body={`"${item.question}"을(를) 삭제합니다.`}
          confirmLabel="삭제"
          action={async () => { await deleteFaqItem(item.id); router.refresh() }}
        />
      </td>
    </tr>
  )
}
