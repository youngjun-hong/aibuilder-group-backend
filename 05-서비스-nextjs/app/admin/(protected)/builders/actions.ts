'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/session'
import { validateSlugFormat } from '@/lib/content/slug'
import { isBuilderSlugTaken, isBuilderEmailTaken, getBuilderByIdForAdmin } from '@/lib/data/builders'
import { revalidateBuilder } from '@/lib/revalidate'
import type { BuilderRole } from '@/lib/types'

export type CreateBuilderState = { error: string | null; tempPassword?: string }
export type ProfileFormState = { error: string | null }

function randomPassword(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

/* 본인 계정의 관리자 권한 박탈·비활성화를 막는다 — 현재 관리자가 1명뿐인 상태에서
   실수로 자기 계정을 잠그면 되돌릴 방법이 Supabase 대시보드 수동 조작뿐이라 위험하다. */
function assertNotSelfLockout(me: { id: string }, targetId: string, patch: { role?: BuilderRole; isActive?: boolean }) {
  if (me.id !== targetId) return
  if (patch.isActive === false) throw new Error('본인 계정은 회수할 수 없습니다')
  if (patch.role && patch.role !== 'admin') throw new Error('본인 계정의 권한은 낮출 수 없습니다')
}

/** 신규 계정 발급(A-06) — auth.users 생성 + builders row insert. 임시 비밀번호는 한 번만 반환된다. */
export async function createBuilder(_prev: CreateBuilderState, formData: FormData): Promise<CreateBuilderState> {
  await requireAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim()
  const role = (String(formData.get('role') ?? 'builder') as BuilderRole)
  const roleLabel = String(formData.get('role_label') ?? '').trim() || null

  if (!email || !email.includes('@')) return { error: '올바른 이메일을 입력하세요' }
  if (!name) return { error: '이름을 입력하세요' }
  if (!slug || !validateSlugFormat(slug)) return { error: '슬러그는 영문 소문자·숫자·하이픈만 가능합니다' }
  if (await isBuilderSlugTaken(slug)) return { error: '이미 사용 중인 슬러그입니다' }
  if (await isBuilderEmailTaken(email)) return { error: '이미 등록된 이메일입니다' }

  const service = createServiceClient()
  const tempPassword = randomPassword()
  const { data: authUser, error: authError } = await service.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })
  if (authError || !authUser.user) return { error: '계정 생성에 실패했습니다: ' + (authError?.message ?? '') }

  const { error } = await service.from('builders').insert({
    auth_user_id: authUser.user.id,
    slug,
    name,
    email,
    role,
    role_label: roleLabel,
    is_active: true,
  })
  if (error) {
    await service.auth.admin.deleteUser(authUser.user.id) // builders row 없이 auth 계정만 남는 상태 방지
    return { error: '저장에 실패했습니다: ' + error.message }
  }

  revalidateBuilder()
  return { error: null, tempPassword }
}

/** 프로필 편집 — 이름·슬러그·권한·소개 등 전체. 이메일·비밀번호는 여기서 안 바꾼다(계정 자체는 auth 소관). */
export async function updateBuilderProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const me = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim()
  const role = String(formData.get('role') ?? 'builder') as BuilderRole
  const roleLabel = String(formData.get('role_label') ?? '').trim() || null
  const oneLiner = String(formData.get('one_liner') ?? '').trim() || null
  const avatarUrl = String(formData.get('avatar_url') ?? '').trim() || null
  const bio = String(formData.get('bio') ?? '').trim() || null
  const focus = String(formData.get('focus') ?? '').trim() || null
  const stackTags = String(formData.get('stack_tags') ?? '').split(',').map(t => t.trim()).filter(Boolean)
  const isFeatured = formData.get('is_featured') === 'on'
  const isNew = formData.get('is_new') === 'on'
  const doneCount = Math.max(0, Number(formData.get('done_count') ?? 0) || 0)

  const principleTitles = formData.getAll('principle_title').map(String)
  const principleBodies = formData.getAll('principle_body').map(String)
  const principles = principleTitles
    .map((t, i) => ({ title: t.trim(), body: (principleBodies[i] ?? '').trim() }))
    .filter(p => p.title)

  const extraLinkLabel = String(formData.get('extra_link_label') ?? '').trim()
  const extraLinkHref = String(formData.get('extra_link_href') ?? '').trim()
  const extraLink = extraLinkLabel && extraLinkHref ? { label: extraLinkLabel, href: extraLinkHref } : null

  if (!name) return { error: '이름을 입력하세요' }
  if (!slug || !validateSlugFormat(slug)) return { error: '슬러그는 영문 소문자·숫자·하이픈만 가능합니다' }
  if (await isBuilderSlugTaken(slug, id)) return { error: '이미 사용 중인 슬러그입니다' }

  try {
    assertNotSelfLockout(me, id, { role })
  } catch (e) {
    return { error: e instanceof Error ? e.message : '처리할 수 없습니다' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('builders')
    .update({
      name, slug, role, role_label: roleLabel, one_liner: oneLiner, avatar_url: avatarUrl,
      bio, focus, stack_tags: stackTags, principles, extra_link: extraLink,
      is_featured: isFeatured, is_new: isNew, done_count: doneCount,
    })
    .eq('id', id)
  if (error) return { error: '저장에 실패했습니다: ' + error.message }

  revalidateBuilder()
  return { error: null }
}

/** 계정 회수/복구 — PRD D4: 회수해도 이미 발행된 콘텐츠는 유지(삭제하지 않음, is_active 만 끈다). */
export async function toggleBuilderActive(id: string, isActive: boolean) {
  const me = await requireAdmin()
  assertNotSelfLockout(me, id, { isActive })
  const supabase = await createClient()
  const { error } = await supabase.from('builders').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateBuilder()
}

/** 비밀번호 재발급 — 새 임시 비밀번호를 호출부에 1회 반환(저장하지 않음, 화면에서만 잠깐 보여줌). */
export async function resetBuilderPassword(id: string): Promise<string> {
  await requireAdmin()
  const row = await getBuilderByIdForAdmin(id)
  if (!row) throw new Error('계정을 찾을 수 없습니다')

  const service = createServiceClient()
  const tempPassword = randomPassword()
  const { error } = await service.auth.admin.updateUserById(row.auth_user_id, { password: tempPassword })
  if (error) throw new Error(error.message)
  return tempPassword
}
