'use client'

import { useState } from 'react'

type Principle = { title: string; body: string }

/* 원칙 목록 — WorkEditor 의 BuilderMultiSelect 와 같은 패턴: 선택 결과를 hidden 아님, 이름이 같은
   input 배열(principle_title[]/principle_body[])로 실어서 서버 액션이 순서대로 짝지어 읽는다. */
export default function PrincipleList({ defaultValue }: { defaultValue: Principle[] }) {
  const [rows, setRows] = useState<Principle[]>(defaultValue.length > 0 ? defaultValue : [])

  return (
    <div>
      {rows.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
          <input
            type="text"
            name="principle_title"
            placeholder="제목"
            value={p.title}
            onChange={e => {
              const next = [...rows]
              next[i] = { ...next[i], title: e.target.value }
              setRows(next)
            }}
            style={{ flex: '0 0 160px' }}
          />
          <input
            type="text"
            name="principle_body"
            placeholder="설명"
            value={p.body}
            onChange={e => {
              const next = [...rows]
              next[i] = { ...next[i], body: e.target.value }
              setRows(next)
            }}
            style={{ flex: 1 }}
          />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
            제거
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setRows([...rows, { title: '', body: '' }])}>
        + 원칙 추가
      </button>
    </div>
  )
}
