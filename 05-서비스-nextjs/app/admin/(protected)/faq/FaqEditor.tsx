'use client'

import { useActionState } from 'react'
import { saveFaqItem } from './actions'

type FaqItemRow = { id: string; topic_id: string; question: string; answer: string; show_on_home: boolean } | null

export default function FaqEditor({
  item,
  topics,
}: {
  item: FaqItemRow
  topics: { id: string; key: string; label: string }[]
}) {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(saveFaqItem, { error: null })

  return (
    <>
      <h1>{item ? 'FAQ 편집' : '새 FAQ'}</h1>

      <form action={formAction} className="admin-form">
        <input type="hidden" name="id" value={item?.id ?? 'new'} />

        <div className="admin-field">
          <label htmlFor="topic_id">주제</label>
          <select id="topic_id" name="topic_id" defaultValue={item?.topic_id ?? ''} required>
            <option value="" disabled>선택하세요</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="question">질문</label>
          <input id="question" name="question" type="text" defaultValue={item?.question} required />
        </div>

        <div className="admin-field">
          <label htmlFor="answer">답변</label>
          <textarea id="answer" name="answer" defaultValue={item?.answer} required rows={4} />
        </div>

        <div className="admin-field">
          <label>
            <input type="checkbox" name="show_on_home" defaultChecked={item?.show_on_home} style={{ width: 'auto', marginRight: 8 }} />
            홈 미리보기에도 노출
          </label>
        </div>

        {state.error && <p className="admin-field error">{state.error}</p>}

        <div className="admin-actions">
          <button className="admin-btn admin-btn--lime" type="submit" disabled={pending}>
            {pending ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </>
  )
}
