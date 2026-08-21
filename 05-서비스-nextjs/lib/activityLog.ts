import { createClient } from '@/lib/supabase/server'

type ActivityEntityType = 'work' | 'insight' | 'video' | 'faq_item' | 'builder'
type ActivityAction = 'created' | 'updated' | 'deleted'

/** 대시보드 "최근 활동" 피드용 기록. best-effort — 실패해도 본 작업(저장/삭제)을 막지 않는다. */
export async function logActivity(
  entityType: ActivityEntityType,
  entityId: string,
  title: string,
  action: ActivityAction,
  actorName?: string | null,
) {
  try {
    const supabase = await createClient()
    await supabase.from('activity_log').insert({
      entity_type: entityType,
      entity_id: entityId,
      title,
      action,
      actor_name: actorName ?? null,
    })
  } catch {
    // 로그 실패는 조용히 무시 — 히스토리 기록이 본 기능을 막으면 안 된다
  }
}
