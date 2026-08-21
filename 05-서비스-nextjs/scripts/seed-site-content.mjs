/**
 * 홈 화면 텍스트 카피 시드 — app/home-view.tsx 에 하드코딩돼 있던 문구를 site_content 로 옮긴다.
 * 실행: node scripts/seed-site-content.mjs (05-서비스-nextjs/ 안에서)
 * 멱등적 upsert — 여러 번 실행해도 안전.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvLocal() {
  const path = join(__dirname, '..', '.env.local')
  const lines = readFileSync(path, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
}
loadEnvLocal()
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

/* [key, section, label, value] — sort 는 배열 순서 그대로(섹션 내에서). */
const ROWS = [
  // ── 히어로 ──
  ['hero.badge', 'hero', '상단 배지', '실제 제작 화면입니다'],
  ['hero.overline', 'hero', '오버라인', '검증된'],
  ['hero.title_1', 'hero', '제목 1행', '바이브 코딩으로,'],
  ['hero.title_mark', 'hero', '제목 강조어', '외주'],
  ['hero.title_suffix', 'hero', '제목 마무리', '를 해드립니다'],
  ['hero.subhead_1', 'hero', '부제 1행', '기획부터 개발, 검수까지 한 팀이 끝까지 맡습니다.'],
  ['hero.subhead_2', 'hero', '부제 2행', '아이디어만 가져오세요 — 나머지는 검증된 빌더의 일입니다.'],
  ['hero.cta_primary', 'hero', '메인 CTA 버튼', '프로젝트 문의'],
  ['hero.cta_secondary', 'hero', '보조 CTA 링크', '작업물 먼저 보기'],
  ['hero.proof_builders_num', 'hero', '증빙 — 빌더 수', '10'],
  ['hero.proof_builders_label', 'hero', '증빙 — 빌더 라벨', '검증된 빌더'],
  ['hero.proof_work_num', 'hero', '증빙 — 프로젝트 수', '9'],
  ['hero.proof_work_label', 'hero', '증빙 — 프로젝트 라벨', '공개 프로젝트'],
  ['hero.proof_system_label', 'hero', '증빙 — 검수 시스템', '검수 시스템'],
  ['hero.scroll_label', 'hero', '스크롤 안내', 'SCROLL'],

  // ── 리본 A (히어로 ↔ 신뢰 섹션, 4줄 로테이션) ──
  ['ribbon_a.line1', 'ribbon_a', '문구 1', 'AI 에이전트 ✳ 랜딩 페이지 ✳ 플랫폼 ✳ 모바일 앱 ✳ 업무 자동화 ✳ '],
  ['ribbon_a.line2', 'ribbon_a', '문구 2', 'PLAN ✳ DESIGN ✳ BUILD ✳ REVIEW ✳ 올인원 턴키 ✳ '],
  ['ribbon_a.line3', 'ribbon_a', '문구 3', '아이디어만 가져오세요 ✳ WE BUILD THE REST ✳ NDA 가능 ✳ '],
  ['ribbon_a.line4', 'ribbon_a', '문구 4', 'PoC 먼저, 확장은 그다음 ✳ SHIP FAST, SHIP RIGHT ✳ '],

  // ── 리본 B (인사이트 ↔ 콘텐츠, 4줄 로테이션) ──
  ['ribbon_b.line1', 'ribbon_b', '문구 1', 'VIBE CODING ✳ 검증된 빌더 ✳ AI BUILDER GROUP ✳ 외주를 해드립니다 ✳ '],
  ['ribbon_b.line2', 'ribbon_b', '문구 2', 'AI가 짓고, 사람이 검수합니다 ✳ MADE WITH AI, FINISHED BY HUMANS ✳ '],
  ['ribbon_b.line3', 'ribbon_b', '문구 3', '상담·견적 무료 ✳ 24시간 내 회신 ✳ AI BUILDER GROUP ✳ '],
  ['ribbon_b.line4', 'ribbon_b', '문구 4', '대충 만든 결과물은 통과 못 함 ✳ QUALITY GATE: ON ✳ 검수 통과분만 전달 ✳ '],

  // ── 신뢰 섹션(S4) ──
  ['trust.title_mark', 'trust', '제목 강조어', '대충'],
  ['trust.title_line1', 'trust', '제목 1행', '만든 결과물은'],
  ['trust.title_line2', 'trust', '제목 2행', '통과하지 못합니다'],
  ['trust.laurel1_top', 'trust', '라우렐1 — 상단', 'YOUTUBE CREATOR'],
  ['trust.laurel1_big', 'trust', '라우렐1 — 큰글씨', '8.4만'],
  ['trust.laurel1_sub', 'trust', '라우렐1 — 하단', 'SUBSCRIBERS'],
  ['trust.laurel2_top', 'trust', '라우렐2 — 상단', 'SELECTED BY'],
  ['trust.laurel2_big', 'trust', '라우렐2 — 큰글씨', 'FORBES KOREA'],
  ['trust.laurel2_sub', 'trust', '라우렐2 — 하단', '30 UNDER 30'],
  ['trust.laurel3_top', 'trust', '라우렐3 — 상단', 'KOREA MARKET'],
  ['trust.laurel3_big', 'trust', '라우렐3 — 큰글씨', 'No.1'],
  ['trust.laurel3_sub', 'trust', '라우렐3 — 하단', 'FREELANCER PLATFORM'],
  ['trust.card1_pill', 'trust', '카드1(교육) — 알약 텍스트', '커리큘럼 수료'],
  ['trust.card1_heading', 'trust', '카드1(교육) — 제목', '교육 — 김이솝 커리큘럼'],
  ['trust.card1_desc', 'trust', '카드1(교육) — 설명', '그가 설계한 과정을 '],
  ['trust.card1_mark', 'trust', '카드1(교육) — 강조부', '수료한 빌더만 투입'],
  ['trust.card2_bubble', 'trust', '카드2(검수) — 말풍선', '오늘 검수 2건 통과 ✓'],
  ['trust.card2_heading', 'trust', '카드2(검수) — 제목', '검수 — (주)똑똑한개발자'],
  ['trust.card2_desc', 'trust', '카드2(검수) — 설명', '크몽 자회사 — '],
  ['trust.card2_mark', 'trust', '카드2(검수) — 강조부', '전 결과물 기준 심사'],
  ['trust.card3_badge', 'trust', '카드3(매칭) — 배지', '매칭 완료'],
  ['trust.card3_builder_name', 'trust', '카드3(매칭) — 빌더명', '빌더 유나'],
  ['trust.card3_builder_role', 'trust', '카드3(매칭) — 빌더 역할', 'AI 서비스'],
  ['trust.card3_heading', 'trust', '카드3(매칭) — 제목', '매칭·보증 — 크몽'],
  ['trust.card3_desc', 'trust', '카드3(매칭) — 설명', '거래·정산을 '],
  ['trust.card3_mark', 'trust', '카드3(매칭) — 강조부', '마켓 안전망이 보증'],
  ['trust.flow1_label', 'trust', '플로우1 — 라벨', '교육'],
  ['trust.flow1_sub', 'trust', '플로우1 — 부연', '커리큘럼 수료'],
  ['trust.flow2_label', 'trust', '플로우2 — 라벨', '제작'],
  ['trust.flow2_sub', 'trust', '플로우2 — 부연', '검증된 빌더'],
  ['trust.flow3_label', 'trust', '플로우3 — 라벨', '검수'],
  ['trust.flow3_sub', 'trust', '플로우3 — 부연', '9년차 기준 심사'],
  ['trust.flow4_label', 'trust', '플로우4 — 라벨', '고객 전달'],
  ['trust.flow4_sub', 'trust', '플로우4 — 부연', '검수 통과분만'],

  // ── 파트너 실적(S4b) ──
  ['partner.title_1', 'partner', '제목 1행', '똑똑한 개발자는 다양한 기업의'],
  ['partner.title_2', 'partner', '제목 2행', '복잡한 문제를 함께 해결해 왔습니다'],
  ['partner.subtitle', 'partner', '부제', '이제 그 기준을 바이브 코딩에 적용합니다'],
  ['partner.cta_mark', 'partner', '강조 문구', '믿고 맡기세요'],
  ['partner.stat1_num', 'partner', '통계1 — 숫자', '3'],
  ['partner.stat1_unit', 'partner', '통계1 — 단위', '단계'],
  ['partner.stat1_label', 'partner', '통계1 — 설명', '모든 단계 확인 후 진행'],
  ['partner.stat2_num', 'partner', '통계2 — 숫자', '17'],
  ['partner.stat2_unit', 'partner', '통계2 — 단위', '화면'],
  ['partner.stat2_label', 'partner', '통계2 — 설명', '범위를 화면 단위로 확정'],
  ['partner.stat3_num', 'partner', '통계3 — 숫자', '3'],
  ['partner.stat3_unit', 'partner', '통계3 — 단위', '주'],
  ['partner.stat3_label', 'partner', '통계3 — 설명', '랜딩 표준 납기'],
  ['partner.stat4_num', 'partner', '통계4 — 숫자', '30'],
  ['partner.stat4_unit', 'partner', '통계4 — 단위', '일'],
  ['partner.stat4_label', 'partner', '통계4 — 설명', '무상 하자보수 보장'],

  // ── 문제 제기(S2) ──
  ['problem.title_1', 'problem', '제목 1행', '요즘 바이브 코딩 외주,'],
  ['problem.title_2', 'problem', '제목 2행', '이런 곳은 조심하세요'],
  ['problem.note', 'problem', '안내문', '스크롤을 내리면, 실제로 시장에서 벌어지고 있는 일들이 하나씩 나타납니다.'],
  ['problem.card1_title1', 'problem', '카드1 — 제목 1행', '포트폴리오 수백 개,'],
  ['problem.card1_title2', 'problem', '카드1 — 제목 2행', '전부 목업인 업체'],
  ['problem.card1_desc', 'problem', '카드1 — 설명', '실서비스 URL을 물어보세요. '],
  ['problem.card1_mark', 'problem', '카드1 — 강조부', '답 못 하면 목업'],
  ['problem.card2_title1', 'problem', '카드2 — 제목 1행', '모든 섹션이 똑같이'],
  ['problem.card2_title2', 'problem', '카드2 — 제목 2행', '움직이는 사이트'],
  ['problem.card2_desc', 'problem', '카드2 — 설명', '전부 같은 애니메이션이면 — '],
  ['problem.card2_mark', 'problem', '카드2 — 강조부', '한 번에 뽑은 겁니다.'],
  ['problem.card3_title1', 'problem', '카드3 — 제목 1행', '싼 가격만 내세우는'],
  ['problem.card3_title2', 'problem', '카드3 — 제목 2행', '반값 외주'],
  ['problem.card3_desc', 'problem', '카드3 — 설명', '반값의 결말은 '],
  ['problem.card3_mark', 'problem', '카드3 — 강조부', '다시 만드는 비용'],

  // ── 일하는 방식(S3) ──
  ['process.title_1', 'process', '제목 1행', '그래서 우리는,'],
  ['process.title_2', 'process', '제목 2행', '일하는 방식이 다릅니다'],
  ['process.step1_title', 'process', '1단계 — 제목', '기획'],
  ['process.step1_desc', 'process', '1단계 — 설명', '요구사항을 화면 목록과 기능 명세로 확정합니다. 여기서 정해진 범위가 모든 판단의 기준선이 됩니다.'],
  ['process.step1_output', 'process', '1단계 — 산출물', '산출물 — 기획서 · IA · 화면 정의'],
  ['process.step2_title', 'process', '2단계 — 제목', '디자인 · 목업'],
  ['process.step2_desc', 'process', '2단계 — 설명', '기능이 동작하는 가상 사이트(목업)로 확인합니다. 그림이 아니라 실제로 눌러보고 결정합니다.'],
  ['process.step2_output', 'process', '2단계 — 산출물', '산출물 — 동작 목업 · 디자인 시안'],
  ['process.step3_title', 'process', '3단계 — 제목', '개발'],
  ['process.step3_desc', 'process', '3단계 — 설명', '확정된 시안과 화면상 100% 동일한 완성도로 구현합니다. 검색 최적화 세팅까지 기본입니다.'],
  ['process.step3_output', 'process', '3단계 — 산출물', '산출물 — 배포 사이트 · SEO 세팅'],
  ['process.step4_title', 'process', '4단계 — 제목', '검수 · 이관'],
  ['process.step4_desc', 'process', '4단계 — 설명', '단계마다 확인을 받고 진행하며, 완료 후 모든 계정과 권한을 안전하게 이전합니다.'],
  ['process.step4_output', 'process', '4단계 — 산출물', '산출물 — 인계 문서 · 계정 이관'],

  // ── 맞춤 매칭(S5) ──
  ['matching.title_1', 'matching', '제목 1행', '개발사를 고르지 마세요.'],
  ['matching.title_2', 'matching', '제목 2행', '맞는 개발자를 매칭해 드립니다'],
  ['matching.cta_label', 'matching', '헤더 CTA', '어떤 빌더들인지 보러가기'],
  ['matching.lead', 'matching', '리드 문구', '프로젝트 성격에 맞는 빌더를 선별해 배정합니다.'],
  ['matching.card1_kicker', 'matching', '카드1 — 키커', 'Match — 01'],
  ['matching.card1_title', 'matching', '카드1 — 제목', '랜딩 · 웹사이트'],
  ['matching.card1_sub', 'matching', '카드1 — 부제', '브랜드 사이트, 수주용 랜딩'],
  ['matching.card1_desc', 'matching', '카드1 — 설명', '디자인 감도와 인터랙션 구현력이 검증된 빌더가 맡습니다. 전환 트래킹 설계까지 포함합니다.'],
  ['matching.card1_who', 'matching', '카드1 — 담당 표기', 'Builder — Design & Interaction'],
  ['matching.card2_kicker', 'matching', '카드2 — 키커', 'Match — 02'],
  ['matching.card2_title', 'matching', '카드2 — 제목', 'SaaS · 플랫폼'],
  ['matching.card2_sub', 'matching', '카드2 — 부제', '관리자·데이터 구조가 있는 서비스'],
  ['matching.card2_desc', 'matching', '카드2 — 설명', '데이터 모델링과 권한 설계 경험이 있는 빌더를 배정합니다. 규모가 크면 시니어 개발자와 투트랙으로.'],
  ['matching.card2_who', 'matching', '카드2 — 담당 표기', 'Builder — Data & Architecture'],
  ['matching.card3_kicker', 'matching', '카드3 — 키커', 'Match — 03'],
  ['matching.card3_title', 'matching', '카드3 — 제목', 'AI 서비스'],
  ['matching.card3_sub', 'matching', '카드3 — 부제', 'LLM 연동, AI 기능 탑재'],
  ['matching.card3_desc', 'matching', '카드3 — 설명', 'AI API 연동과 프롬프트 설계를 실무로 다뤄본 빌더가 맡습니다. PoC부터 단계적으로 검증합니다.'],
  ['matching.card3_who', 'matching', '카드3 — 담당 표기', 'Builder — LLM & Evaluation'],

  // ── 섹션 헤더(Work/Insight/Content/FAQ 프리뷰 — 목록 자체는 실데이터, 헤더 문구만) ──
  ['work_preview.title', 'section_headers', 'Work 프리뷰 — 제목', '완성한 프로젝트'],
  ['work_preview.more_label', 'section_headers', 'Work 프리뷰 — 더보기', '전체 보기'],
  ['work_preview.lead', 'section_headers', 'Work 프리뷰 — 리드', '실제로 수행한 프로젝트만 올립니다.'],
  ['insight_preview.title', 'section_headers', 'Insight 프리뷰 — 제목', '우리의 생각'],
  ['insight_preview.more_label', 'section_headers', 'Insight 프리뷰 — 더보기', '전체 보기'],
  ['content_preview.title', 'section_headers', 'Content 프리뷰 — 제목', '영상으로 보는 우리의 작업'],
  ['content_preview.more_label', 'section_headers', 'Content 프리뷰 — 더보기', '콘텐츠 탭'],
  ['content_preview.lead', 'section_headers', 'Content 프리뷰 — 리드', '세 채널에서 매주 실전 바이브 코딩 콘텐츠가 올라옵니다.'],
  ['faq_preview.title', 'section_headers', 'FAQ 프리뷰 — 제목', '자주 묻는 질문'],
  ['faq_preview.more_label', 'section_headers', 'FAQ 프리뷰 — 더보기', '전체 보기'],
  ['faq_preview.lead', 'section_headers', 'FAQ 프리뷰 — 리드', '문의 전에 가장 많이 받는 질문을 모았습니다.'],

  // ── 최종 CTA(S10) ──
  ['final_cta.title_1', 'final_cta', '제목 1행', '만들고 싶은 것이'],
  ['final_cta.title_2', 'final_cta', '제목 2행', '있으신가요?'],
  ['final_cta.body', 'final_cta', '본문', '지금 프로젝트를 문의해 주세요. 빠르게 연락드립니다.'],
  ['final_cta.button', 'final_cta', '버튼', '프로젝트 문의'],

  // ── 플로팅 독 ──
  ['dock.title', 'dock', '제목', '검증된 바이브 코딩'],
  ['dock.subtitle', 'dock', '부제', '무료 문의 — 부담 없이 남겨보세요'],
  ['dock.button', 'dock', '버튼', '프로젝트 문의'],

  // ── 푸터(전 페이지 공통) ──
  ['footer.tagline', 'footer', '브랜드 소개 문구', 'AI 시대에 최적화된 바이브코딩 외주 전문 그룹'],
  ['footer.email', 'footer', '문의 이메일', 'contact@_______'],
  ['footer.copyright', 'footer', '저작권 문구', '© 2026 AI Builder Group'],
]

async function main() {
  const bySection = new Map()
  const rows = ROWS.map(([key, section, label, value]) => {
    const sort = bySection.get(section) ?? 0
    bySection.set(section, sort + 1)
    return { key, section, label, value, sort }
  })
  const { data, error } = await db.from('site_content').upsert(rows, { onConflict: 'key' }).select('key')
  if (error) throw error
  console.log(`site_content: ${data.length}개 upsert 완료 (섹션 ${bySection.size}개)`)
}

main().catch(err => { console.error(err); process.exit(1) })
