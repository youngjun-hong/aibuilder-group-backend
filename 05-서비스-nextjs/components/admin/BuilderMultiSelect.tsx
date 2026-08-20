'use client'

import { useState } from 'react'

type BuilderOption = { id: string; name: string; roleLabel: string | null }
type Selected = { builderId: string; roleLabel: string }

/* FR-A05-02 — 참여 빌더 다중 선택 + 역할 라벨. 선택 결과는 hidden input 배열(builder_id[],
   builder_role_label[])로 폼에 실어서 서버 액션이 work_builders 를 통째로 교체하게 한다. */
export default function BuilderMultiSelect({
  options,
  defaultValue,
}: {
  options: BuilderOption[]
  defaultValue: Selected[]
}) {
  const [selected, setSelected] = useState<Selected[]>(defaultValue)
  const [query, setQuery] = useState('')

  const available = options.filter(o => !selected.some(s => s.builderId === o.id) && o.name.includes(query))

  return (
    <div>
      {selected.map((s, i) => {
        const opt = options.find(o => o.id === s.builderId)
        return (
          <span className="admin-builder-chip" key={s.builderId} style={{ marginRight: 6, marginBottom: 6, display: 'inline-flex' }}>
            <input type="hidden" name="builder_id" value={s.builderId} />
            <b>{opt?.name ?? s.builderId}</b>
            <input
              type="text"
              name="builder_role_label"
              placeholder="역할"
              value={s.roleLabel}
              onChange={e => {
                const next = [...selected]
                next[i] = { ...next[i], roleLabel: e.target.value }
                setSelected(next)
              }}
            />
            <button type="button" onClick={() => setSelected(selected.filter((_, j) => j !== i))} aria-label="제거">
              ✕
            </button>
          </span>
        )
      })}

      <div style={{ marginTop: 8 }}>
        <input
          type="text"
          placeholder="빌더 이름 검색"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        {query && (
          <div className="admin-builder-picker" style={{ marginTop: 6 }}>
            {available.slice(0, 8).map(o => (
              <label key={o.id}>
                <input
                  type="checkbox"
                  onChange={() => {
                    setSelected([...selected, { builderId: o.id, roleLabel: o.roleLabel ?? '' }])
                    setQuery('')
                  }}
                />
                {o.name} <span className="hint">{o.roleLabel}</span>
              </label>
            ))}
            {available.length === 0 && <span className="hint">검색 결과 없음</span>}
          </div>
        )}
      </div>
    </div>
  )
}
