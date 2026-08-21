import { createClient } from '@/lib/supabase/server'
import { createAnonClient } from '@/lib/supabase/anon'

/** 홈 화면 등에서 쓰는 공개 조회 — {key: value} 맵. 세션 비의존. */
export async function getSiteContentMap(): Promise<Record<string, string>> {
  const supabase = createAnonClient()
  const { data, error } = await supabase.from('site_content').select('key, value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
}

export type SiteContentRow = { key: string; section: string; label: string; value: string; sort: number }
export type SiteContentSection = { section: string; items: SiteContentRow[] }

/* 섹션 표시 순서 + 한글 라벨 — home-view.tsx 구성 순서를 그대로 따른다. */
const SECTION_ORDER = [
  ['hero', '히어로'],
  ['ribbon_a', '리본 문구 A (히어로 ↔ 신뢰 섹션)'],
  ['trust', '신뢰 섹션'],
  ['partner', '파트너 실적'],
  ['problem', '문제 제기'],
  ['process', '일하는 방식'],
  ['matching', '맞춤 매칭'],
  ['section_headers', '목록 섹션 헤더 (Work·Insight·Content·FAQ)'],
  ['ribbon_b', '리본 문구 B (인사이트 ↔ 콘텐츠)'],
  ['final_cta', '최종 CTA'],
  ['dock', '플로팅 문의 바'],
  ['footer', '푸터 (전 페이지 공통)'],
] as const

export function sectionLabel(section: string): string {
  return SECTION_ORDER.find(([s]) => s === section)?.[1] ?? section
}

/** 관리자 — 섹션별로 그룹핑해서 반환(home-view.tsx 구성 순서). */
export async function listSiteContentForAdmin(): Promise<SiteContentSection[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_content').select('key, section, label, value, sort').order('sort')
  if (error) throw error
  const rows = (data ?? []) as SiteContentRow[]
  return SECTION_ORDER.map(([section]) => ({
    section,
    items: rows.filter(r => r.section === section),
  })).filter(s => s.items.length > 0)
}
