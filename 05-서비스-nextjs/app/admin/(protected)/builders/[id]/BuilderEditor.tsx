'use client'

import { useActionState, useState } from 'react'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { useUnsavedChangesGuard } from '@/components/admin/useUnsavedChangesGuard'
import PrincipleList from './PrincipleList'
import ResetPasswordButton from './ResetPasswordButton'
import BuilderStatusButton from '../BuilderStatusButton'
import { updateBuilderProfile } from '../actions'
import type { ProfileFormState } from '../actions'
import type { BuilderRole } from '@/lib/types'

type BuilderRow = {
  id: string
  slug: string
  name: string
  email: string
  role: BuilderRole
  role_label: string | null
  one_liner: string | null
  avatar_url: string | null
  is_active: boolean
  bio: string | null
  focus: string | null
  stack_tags: string[]
  principles: { title: string; body: string }[]
  extra_link: { label: string; href: string } | null
  is_featured: boolean
  done_count: number
  is_new: boolean
}

export default function BuilderEditor({ builder, isSelf }: { builder: BuilderRow; isSelf: boolean }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updateBuilderProfile, { error: null })
  const [dirty, setDirty] = useState(false)
  useUnsavedChangesGuard(dirty)

  return (
    <>
      <h1>{builder.name}</h1>
      <p className="sub">
        {builder.email} · <span className={`admin-badge admin-badge--${builder.is_active ? 'published' : 'archived'}`}>
          {builder.is_active ? '활성' : '회수됨'}
        </span>
        {isSelf && <span className="hint"> · 본인 계정</span>}
      </p>

      <form action={formAction} className="admin-form" onChange={() => setDirty(true)}>
        <input type="hidden" name="id" value={builder.id} />

        <div className="admin-field">
          <label htmlFor="name">이름</label>
          <input id="name" name="name" type="text" defaultValue={builder.name} required />
        </div>

        <div className="admin-field">
          <label htmlFor="slug">슬러그</label>
          <input id="slug" name="slug" type="text" defaultValue={builder.slug} required />
          <span className="hint">공개 프로필(/builder?b=슬러그) 주소에 쓰입니다.</span>
        </div>

        <div className="admin-field">
          <label htmlFor="role">권한</label>
          <select id="role" name="role" defaultValue={builder.role} disabled={isSelf}>
            <option value="builder">빌더</option>
            <option value="admin">관리자</option>
          </select>
          {isSelf && <span className="hint">본인 계정의 권한은 여기서 낮출 수 없습니다.</span>}
        </div>

        <div className="admin-field">
          <label htmlFor="role_label">역할 라벨</label>
          <input id="role_label" name="role_label" type="text" defaultValue={builder.role_label ?? ''} placeholder="Full-stack Developer" />
        </div>

        <div className="admin-field">
          <label htmlFor="one_liner">한 줄 소개</label>
          <input id="one_liner" name="one_liner" type="text" defaultValue={builder.one_liner ?? ''} />
        </div>

        <ImageUploadField name="avatar_url" label="아바타 이미지" defaultValue={builder.avatar_url} />

        <div className="admin-field">
          <label htmlFor="bio">소개</label>
          <textarea id="bio" name="bio" defaultValue={builder.bio ?? ''} rows={4} />
        </div>

        <div className="admin-field">
          <label htmlFor="focus">전문 분야</label>
          <input id="focus" name="focus" type="text" defaultValue={builder.focus ?? ''} />
        </div>

        <div className="admin-field">
          <label htmlFor="stack_tags">기술 스택 <span className="hint">(쉼표로 구분)</span></label>
          <input id="stack_tags" name="stack_tags" type="text" defaultValue={builder.stack_tags.join(', ')} placeholder="Next.js, Supabase, LLM API" />
        </div>

        <div className="admin-field">
          <label>원칙</label>
          <PrincipleList defaultValue={builder.principles} />
        </div>

        <div className="admin-field">
          <label>추가 링크 <span className="hint">(포트폴리오·깃허브 등, 선택)</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input name="extra_link_label" type="text" placeholder="라벨" defaultValue={builder.extra_link?.label ?? ''} style={{ flex: '0 0 160px' }} />
            <input name="extra_link_href" type="url" placeholder="https://…" defaultValue={builder.extra_link?.href ?? ''} style={{ flex: 1 }} />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="done_count">완료 프로젝트 수</label>
          <input id="done_count" name="done_count" type="number" min={0} defaultValue={builder.done_count} style={{ maxWidth: 120 }} />
        </div>

        <div className="admin-field">
          <label><input type="checkbox" name="is_featured" defaultChecked={builder.is_featured} /> 추천 빌더로 노출</label>
        </div>
        <div className="admin-field">
          <label><input type="checkbox" name="is_new" defaultChecked={builder.is_new} /> NEW 배지 표시</label>
        </div>

        {state.error && <p className="admin-field error">{state.error}</p>}

        <div className="admin-actions">
          <button className="admin-btn admin-btn--lime" type="submit" disabled={pending} onClick={() => setDirty(false)}>
            {pending ? '저장 중…' : '저장'}
          </button>
          <ResetPasswordButton id={builder.id} />
          <BuilderStatusButton id={builder.id} isActive={builder.is_active} isSelf={isSelf} />
        </div>
      </form>
    </>
  )
}
