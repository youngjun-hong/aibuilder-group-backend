'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import BuilderMultiSelect from '@/components/admin/BuilderMultiSelect'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { useUnsavedChangesGuard } from '@/components/admin/useUnsavedChangesGuard'
import { saveWork, submitWork, publishWork, rejectWork, archiveWork, restoreWork } from '../actions'
import type { Category, ContentStatus } from '@/lib/types'

type WorkRow = {
  id: string
  slug: string
  title: string
  summary: string
  category_id: string | null
  hero_url: string | null
  thumb_url: string | null
  body_problem: string | null
  body_solution: string | null
  body_result: string | null
  tech_tags: string[]
  period_label: string | null
  scope_label: string | null
  result_url: string | null
  status: ContentStatus
  reject_reason: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  work_builders: { builder_id: string; role_label: string | null; sort: number }[]
}

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '초안', pending: '승인대기', published: '발행', rejected: '반려', archived: '보관',
}

export default function WorkEditor({
  work,
  categories,
  builderOptions,
  isAdmin,
}: {
  work: WorkRow | null
  categories: Category[]
  builderOptions: { id: string; name: string; roleLabel: string | null }[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(saveWork, { error: null })
  const [dirty, setDirty] = useState(false)
  useUnsavedChangesGuard(dirty)

  const status = work?.status ?? 'draft'
  const locked = status === 'pending'
  const defaultBuilders = (work?.work_builders ?? [])
    .sort((a, b) => a.sort - b.sort)
    .map(wb => ({ builderId: wb.builder_id, roleLabel: wb.role_label ?? '' }))

  return (
    <>
      <h1>{work ? 'Work 편집' : '새 Work'}</h1>
      {work && <p className="sub"><span className={`admin-badge admin-badge--${status}`}>{STATUS_LABEL[status]}</span></p>}

      {work?.reject_reason && status === 'rejected' && (
        <div className="admin-reject-banner"><b>반려 사유</b><br />{work.reject_reason}</div>
      )}

      <form action={formAction} className="admin-form" onChange={() => setDirty(true)}>
        <input type="hidden" name="id" value={work?.id ?? 'new'} />

        <div className="admin-field">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" type="text" defaultValue={work?.title} required disabled={locked} />
        </div>

        <div className="admin-field">
          <label htmlFor="slug">슬러그</label>
          <input id="slug" name="slug" type="text" defaultValue={work?.slug} required disabled={locked} placeholder="industry-tech-project" />
          <span className="hint">업종·기술 + 프로젝트명 형태로 — 고객사명은 넣지 않습니다. 발행 후 변경 시 이전 주소는 301 처리됩니다.</span>
        </div>

        <div className="admin-field">
          <label htmlFor="category_id">카테고리</label>
          <select id="category_id" name="category_id" defaultValue={work?.category_id ?? ''} disabled={locked}>
            <option value="">선택 안 함</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="summary">개요</label>
          <textarea id="summary" name="summary" defaultValue={work?.summary} required disabled={locked} rows={2} />
        </div>

        <ImageUploadField name="hero_url" label="히어로 이미지" defaultValue={work?.hero_url} />
        <ImageUploadField name="thumb_url" label="썸네일 (비우면 히어로 이미지 사용)" defaultValue={work?.thumb_url} />

        <div className="admin-field">
          <label htmlFor="body_problem">01 · 문제</label>
          <textarea id="body_problem" name="body_problem" defaultValue={work?.body_problem ?? ''} disabled={locked} rows={4} />
        </div>
        <div className="admin-field">
          <label htmlFor="body_solution">02 · 해결</label>
          <textarea id="body_solution" name="body_solution" defaultValue={work?.body_solution ?? ''} disabled={locked} rows={4} />
        </div>
        <div className="admin-field">
          <label htmlFor="body_result">03 · 결과</label>
          <textarea id="body_result" name="body_result" defaultValue={work?.body_result ?? ''} disabled={locked} rows={4} />
        </div>

        <div className="admin-field">
          <label htmlFor="tech_tags">기술 태그 <span className="hint">(쉼표로 구분)</span></label>
          <input id="tech_tags" name="tech_tags" type="text" defaultValue={(work?.tech_tags ?? []).join(', ')} disabled={locked} placeholder="Next.js, Supabase, LLM API" />
        </div>

        <div className="admin-field">
          <label>참여 빌더</label>
          <BuilderMultiSelect options={builderOptions} defaultValue={defaultBuilders} />
        </div>

        <div className="admin-field">
          <label htmlFor="period_label">기간</label>
          <input id="period_label" name="period_label" type="text" defaultValue={work?.period_label ?? ''} disabled={locked} placeholder="2주 (PoC)" />
        </div>
        <div className="admin-field">
          <label htmlFor="scope_label">범위</label>
          <input id="scope_label" name="scope_label" type="text" defaultValue={work?.scope_label ?? ''} disabled={locked} placeholder="챗봇 · 관리 콘솔" />
        </div>
        <div className="admin-field">
          <label htmlFor="result_url">결과물 URL</label>
          <input id="result_url" name="result_url" type="url" defaultValue={work?.result_url ?? ''} disabled={locked} />
        </div>

        <div className="admin-field">
          <label htmlFor="seo_title">SEO 타이틀 <span className="hint">(비우면 제목에서 자동 생성)</span></label>
          <input id="seo_title" name="seo_title" type="text" defaultValue={work?.seo_title ?? ''} disabled={locked} />
        </div>
        <div className="admin-field">
          <label htmlFor="seo_description">SEO 설명 <span className="hint">(비우면 개요에서 자동 생성)</span></label>
          <textarea id="seo_description" name="seo_description" defaultValue={work?.seo_description ?? ''} disabled={locked} rows={2} />
        </div>
        <ImageUploadField name="og_image_url" label="OG 이미지 (비우면 히어로 이미지 사용)" defaultValue={work?.og_image_url} />

        {state.error && <p className="admin-field error">{state.error}</p>}

        <div className="admin-actions">
          {!locked && (
            <button className="admin-btn admin-btn--lime" type="submit" disabled={pending} onClick={() => setDirty(false)}>
              {pending ? '저장 중…' : '저장'}
            </button>
          )}

          {work && (status === 'draft' || status === 'rejected') && (
            <ConfirmButton
              label="제출 (승인 요청)"
              title="승인 요청"
              body="제출하면 더 이상 수정할 수 없고 관리자 승인을 기다립니다."
              confirmLabel="제출"
              variant="default"
              action={async () => { await submitWork(work.id); router.refresh() }}
            />
          )}

          {isAdmin && work && status === 'pending' && (
            <>
              <ConfirmButton
                label="승인 (발행)"
                title="발행"
                body="바로 공개 페이지에 발행됩니다."
                confirmLabel="발행"
                variant="default"
                action={async () => { await publishWork(work.id); router.refresh() }}
              />
              <RejectButton id={work.id} onDone={() => router.refresh()} />
            </>
          )}

          {isAdmin && work && status === 'published' && (
            <ConfirmButton
              label="내리기 (보관)"
              title="보관 처리"
              body="공개 페이지에서 내려가고 기존 URL은 목록으로 301 리다이렉트됩니다."
              action={async () => { await archiveWork(work.id); router.refresh() }}
            />
          )}

          {isAdmin && work && status === 'archived' && (
            <ConfirmButton
              label="다시 발행"
              title="복원"
              body="다시 공개 페이지에 발행합니다."
              confirmLabel="발행"
              variant="default"
              action={async () => { await restoreWork(work.id); router.refresh() }}
            />
          )}
        </div>
      </form>
    </>
  )
}

function RejectButton({ id, onDone }: { id: string; onDone: () => void }) {
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return <button type="button" className="admin-btn admin-btn--danger" onClick={() => setOpen(true)}>반려</button>
  }

  return (
    <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h3>반려</h3>
        <p>반려 사유는 필수이며 작성자에게 그대로 표시됩니다.</p>
        <textarea
          className="admin-field"
          style={{ width: '100%', minHeight: 80, marginBottom: 12 }}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="반려 사유를 입력하세요"
        />
        {error && <p className="admin-field error">{error}</p>}
        <div className="row">
          <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>취소</button>
          <button
            className="admin-btn admin-btn--danger"
            type="button"
            disabled={pending}
            onClick={async () => {
              if (!reason.trim()) { setError('반려 사유를 입력하세요'); return }
              setPending(true)
              try {
                await rejectWork(id, reason)
                onDone()
                setOpen(false)
              } catch (e) {
                setError(e instanceof Error ? e.message : '반려에 실패했습니다')
              } finally {
                setPending(false)
              }
            }}
          >
            {pending ? '처리 중…' : '반려'}
          </button>
        </div>
      </div>
    </div>
  )
}
