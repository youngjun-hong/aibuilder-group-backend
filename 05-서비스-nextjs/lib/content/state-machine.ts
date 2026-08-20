import type { BuilderRole, ContentStatus } from '@/lib/types'

/* §7.3 콘텐츠 상태 머신의 단일 소스. works·insights 공통.
   여기선 "이 전이가 이 역할에게 허용되는가"만 판정한다 — 실제 행 소유권(작성자 본인인지)
   체크는 호출하는 서버 액션이 builder.id 를 created_by/author_id 와 비교해서 따로 한다. */
const TRANSITIONS: Record<ContentStatus, Partial<Record<ContentStatus, BuilderRole[]>>> = {
  draft: { pending: ['builder', 'admin'] },
  pending: { published: ['admin'], rejected: ['admin'] },
  published: { archived: ['admin'] },
  rejected: { draft: ['builder', 'admin'] },
  archived: { published: ['admin'] },
}

export class StateTransitionError extends Error {}

export function assertTransition(from: ContentStatus, to: ContentStatus, actorRole: BuilderRole) {
  const allowedActors = TRANSITIONS[from]?.[to]
  if (!allowedActors || !allowedActors.includes(actorRole)) {
    throw new StateTransitionError(`${from} → ${to} 전이는 ${actorRole} 권한으로 할 수 없습니다 (DR-06)`)
  }
}
