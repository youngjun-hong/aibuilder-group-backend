'use client'

import { useActionState } from 'react'
import { saveSiteContentSection } from './actions'
import type { SiteContentRow } from '@/lib/data/siteContent'

export default function SectionForm({ section, title, items }: { section: string; title: string; items: SiteContentRow[] }) {
  const [state, formAction, pending] = useActionState<{ error: string | null; saved?: string }, FormData>(
    saveSiteContentSection,
    { error: null },
  )

  return (
    <details className="admin-section-card" open={items.length <= 6}>
      <summary>{title} <span className="hint">({items.length}개 필드)</span></summary>
      <form action={formAction} className="admin-form" style={{ marginTop: 16 }}>
        <input type="hidden" name="section" value={section} />
        {items.map(item => (
          <div className="admin-field" key={item.key}>
            <label htmlFor={item.key}>{item.label}</label>
            <textarea id={item.key} name={`site_key:${item.key}`} defaultValue={item.value} rows={item.value.length > 60 ? 3 : 1} />
          </div>
        ))}
        {state.error && <p className="admin-field error">{state.error}</p>}
        {state.saved === section && !state.error && <p className="hint" style={{ color: 'var(--ink)' }}>저장됐습니다.</p>}
        <div className="admin-actions">
          <button className="admin-btn admin-btn--lime" type="submit" disabled={pending}>
            {pending ? '저장 중…' : '이 섹션 저장'}
          </button>
        </div>
      </form>
    </details>
  )
}
