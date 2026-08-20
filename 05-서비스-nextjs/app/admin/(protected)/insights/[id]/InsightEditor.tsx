'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import TiptapEditor from '@/components/admin/TiptapEditor'
import ImageUploadField from '@/components/admin/ImageUploadField'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { useUnsavedChangesGuard } from '@/components/admin/useUnsavedChangesGuard'
import { saveInsight, submitInsight, publishInsight, rejectInsight, archiveInsight, restoreInsight } from '../actions'
import type { Category, ContentStatus } from '@/lib/types'

type InsightRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  body_html: string
  category_id: string | null
  thumb_url: string | null
  status: ContentStatus
  reject_reason: string | null
  seo_title: string | null
  seo_description: string | null
}

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '초안', pending: '승인대기', published: '발행', rejected: '반려', archived: '보관',
}

export default function InsightEditor({
  insight,
  categories,
  isAdmin,
}: {
  insight: InsightRow | null
  categories: Category[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(saveInsight, { error: null })
  const [bodyHtml, setBodyHtml] = useState(insight?.body_html ?? '')
  const [dirty, setDirty] = useState(false)
  useUnsavedChangesGuard(dirty)

  const status = insight?.status ?? 'draft'
  const locked = status === 'pending' // DR-07

  return (
    <>
      <h1>{insight ? 'Insight 편집' : '새 Insight'}</h1>
      {insight && <p className="sub"><span className={`admin-badge admin-badge--${status}`}>{STATUS_LABEL[status]}</span></p>}

      {insight?.reject_reason && status === 'rejected' && (
        <div className="admin-reject-banner"><b>반려 사유</b><br />{insight.reject_reason}</div>
      )}

      <form action={formAction} className="admin-form" onChange={() => setDirty(true)}>
        <input type="hidden" name="id" value={insight?.id ?? 'new'} />
        <input type="hidden" name="body_html" value={bodyHtml} />

        <div className="admin-field">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" type="text" defaultValue={insight?.title} required disabled={locked} />
        </div>

        <div className="admin-field">
          <label htmlFor="slug">슬러그</label>
          <input id="slug" name="slug" type="text" defaultValue={insight?.slug} required disabled={locked} placeholder="my-post-slug" />
          <span className="hint">영문 소문자·숫자·하이픈만. 발행 후 바꾸면 이전 주소는 자동으로 301 처리됩니다.</span>
        </div>

        <div className="admin-field">
          <label htmlFor="category_id">카테고리</label>
          <select id="category_id" name="category_id" defaultValue={insight?.category_id ?? ''} disabled={locked}>
            <option value="">선택 안 함</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="excerpt">요약</label>
          <textarea id="excerpt" name="excerpt" defaultValue={insight?.excerpt} required disabled={locked} rows={2} />
        </div>

        <ImageUploadField name="thumb_url" label="썸네일" defaultValue={insight?.thumb_url} />

        <div className="admin-field">
          <label>본문</label>
          {!locked ? (
            <TiptapEditor value={bodyHtml} onChange={html => { setBodyHtml(html); setDirty(true) }} />
          ) : (
            <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          )}
        </div>

        <div className="admin-field">
          <label htmlFor="seo_title">SEO 타이틀 <span className="hint">(비우면 제목에서 자동 생성)</span></label>
          <input id="seo_title" name="seo_title" type="text" defaultValue={insight?.seo_title ?? ''} disabled={locked} />
        </div>
        <div className="admin-field">
          <label htmlFor="seo_description">SEO 설명 <span className="hint">(비우면 요약에서 자동 생성)</span></label>
          <textarea id="seo_description" name="seo_description" defaultValue={insight?.seo_description ?? ''} disabled={locked} rows={2} />
        </div>

        {state.error && <p className="admin-field error">{state.error}</p>}

        <div className="admin-actions">
          {!locked && (
            <button className="admin-btn admin-btn--lime" type="submit" disabled={pending} onClick={() => setDirty(false)}>
              {pending ? '저장 중…' : '저장'}
            </button>
          )}

          {insight && (status === 'draft' || status === 'rejected') && (
            <ConfirmButton
              label="제출 (승인 요청)"
              title="승인 요청"
              body="제출하면 더 이상 수정할 수 없고 관리자 승인을 기다립니다."
              confirmLabel="제출"
              variant="default"
              action={async () => { await submitInsight(insight.id); router.refresh() }}
            />
          )}

          {isAdmin && insight && status === 'pending' && (
            <>
              <ConfirmButton
                label="승인 (발행)"
                title="발행"
                body="바로 공개 페이지에 발행됩니다."
                confirmLabel="발행"
                variant="default"
                action={async () => { await publishInsight(insight.id); router.refresh() }}
              />
              <RejectButton id={insight.id} onDone={() => router.refresh()} />
            </>
          )}

          {isAdmin && insight && status === 'published' && (
            <ConfirmButton
              label="내리기 (보관)"
              title="보관 처리"
              body="공개 페이지에서 내려가고 기존 URL은 목록으로 301 리다이렉트됩니다."
              action={async () => { await archiveInsight(insight.id); router.refresh() }}
            />
          )}

          {isAdmin && insight && status === 'archived' && (
            <ConfirmButton
              label="다시 발행"
              title="복원"
              body="다시 공개 페이지에 발행합니다."
              confirmLabel="발행"
              variant="default"
              action={async () => { await restoreInsight(insight.id); router.refresh() }}
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
    return (
      <button type="button" className="admin-btn admin-btn--danger" onClick={() => setOpen(true)}>반려</button>
    )
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
                await rejectInsight(id, reason)
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
