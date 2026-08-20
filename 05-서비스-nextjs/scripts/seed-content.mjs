/**
 * 1회성 시드 스크립트 — 관리자 플랫폼 도입 전 app/work/view.tsx · app/insight/view.tsx ·
 * app/builder/view.tsx 에 하드코딩돼 있던 콘텐츠를 DB로 옮긴다.
 *
 * 실행: node scripts/seed-content.mjs  (05-서비스-nextjs/ 안에서, .env.local 로드됨)
 * 멱등적으로 짰다 — 여러 번 실행해도 안전(upsert).
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* .env.local 을 직접 파싱 (dotenv 의존성 추가 없이) */
function loadEnvLocal() {
  const path = join(__dirname, '..', '.env.local')
  const lines = readFileSync(path, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
}
loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 없습니다.')
  process.exit(1)
}
const db = createClient(url, serviceKey, { auth: { persistSession: false } })

/* ── app/builder/view.tsx 의 PROJECTS — work 시드 원천 (키를 그대로 슬러그로 씀) ── */
const WORK_PROJECTS = {
  iloom: { t: 'iloom — 리빙 커머스 리뉴얼', d: '가구 브랜드 일룸의 커머스 경험 개편. 상품 탐색부터 상담 전환까지 여정 재설계.', img: 'work-iloom.png', tag: 'Commerce', cat: 'commerce', yr: '2026', w: true },
  daisy: { t: 'DAISY — 대홍기획', d: '광고 그룹의 AI 업무 플랫폼 구축.', img: 'work-daisy.png', tag: 'AI · AX', cat: 'aiax', yr: '2026', w: true },
  'aerok-user': { t: 'Aerok User — 사용자 앱', d: '예약·이용 플로우 전면 구축.', img: 'work-aerok-user.jpg', tag: 'O2O', cat: 'platform', yr: '2025', w: false },
  nice: { t: 'NICE 정보통신 — 결제 인프라 어드민', d: '결제 데이터 대시보드와 운영 콘솔. 금융 수준 권한·감사 로그 설계 포함.', img: 'work-nice.png', tag: 'Finance', cat: 'finance', yr: '2025', w: true },
  'aerok-admin': { t: 'Aerok Admin — 운영 콘솔', d: '지점·정산 통합 관리 시스템.', img: 'work-aerok-admin.jpg', tag: 'SaaS · Admin', cat: 'platform', yr: '2025', w: false },
  btv: { t: 'Btv 우리동네광고 — SK브로드밴드', d: '소상공인 TV 광고 셀프 집행 플랫폼.', img: 'work-btv.png', tag: 'Media', cat: 'commerce', yr: '2024', w: true },
  markspon: { t: '마크스폰 EDK', d: '기업 복지 커머스 운영 시스템.', img: 'work-markspon.png', tag: 'SaaS · Admin', cat: 'platform', yr: '2025', w: false },
  canape: { t: 'CANAPE — 도다마인드', d: 'AI 심리 분석 서비스.', img: 'work-canape.png', tag: 'AI · AX', cat: 'aiax', yr: '2023', w: false },
  familycare: { t: '패밀리케어 — 키즈노트', d: '가족 돌봄 연결 서비스.', img: 'work-familycare.jpg', tag: 'Platform', cat: 'platform', yr: '2022', w: false },
}

/* ── app/builder/view.tsx 의 BUILDERS ── */
const BUILDERS = {
  josh: { name: '빌더 조쉬', role_label: '프로덕트 빌더 · 기획+개발', one_liner: '기획자·디자이너·개발자를 합친 원맨 프로덕트 빌더. AI 네이티브 운영법 인터뷰의 그 사람.', bio: '기획자·디자이너·개발자를 합친 원맨 프로덕트 빌더입니다. 요구사항 정리부터 배포까지 한 사람이 끝까지 책임지는 방식으로 일하며, 전달 과정에서 생기는 손실을 없애는 것이 강점입니다. AI 네이티브 운영법 인터뷰의 그 사람.', focus: '프로덕트 전체 · MVP · 검증', stack_tags: ['Next.js', 'LLM API', 'Supabase'], done_count: 14, is_featured: true, is_new: false,
    principles: [['한 사람이 끝까지', '기획·디자인·개발이 한 머리에서 나옵니다. 전달 손실이 없고, 의사결정이 빠릅니다.'], ['말보다 화면', '요구사항은 문서 대신 동작하는 화면으로 정리합니다. 첫 미팅에서 러프 목업을 함께 봅니다.'], ['AI 네이티브', '반복 작업은 에이전트에 맡기고, 사람의 시간은 판단에 씁니다.']],
    extra_link: { label: 'AI 네이티브 운영법 인터뷰 보기', href: '/insight/ai-native-agency-interview' }, avatar_url: '/assets/img/av-josh.jpg', projects: ['iloom', 'btv'] },
  ria: { name: '빌더 리아', role_label: '랜딩 · 인터랙션', one_liner: '디자인 감도와 전환 설계가 강점. 수주용 랜딩과 브랜드 사이트를 주로 맡습니다.', bio: '디자인 감도와 전환 설계가 강점인 빌더입니다. 수주용 랜딩과 브랜드 사이트를 주로 맡으며, 화면의 인상보다 화면이 만들어내는 행동을 먼저 설계합니다.', focus: '수주용 랜딩 · 브랜드 사이트', stack_tags: ['Interaction', 'GA4 설계'], done_count: 9, is_featured: false, is_new: false,
    principles: [['전환에서 역산', '예쁜 화면이 아니라 문의가 생기는 화면을 설계합니다. CTA 동선부터 그립니다.'], ['인터랙션은 근거 위에', '움직임 하나에도 시선 흐름의 이유를 답니다. 과한 모션은 뺍니다.'], ['측정 가능한 디자인', 'GA4 이벤트 설계까지 랜딩의 일부로 봅니다. 열어보고 고칠 수 있게 만듭니다.']],
    extra_link: null, avatar_url: '/assets/img/av-ria.jpg', projects: ['aerok-user', 'familycare'] },
  dohyun: { name: '빌더 도현', role_label: '플랫폼 · 어드민', one_liner: '데이터 모델링과 권한 설계 경험 다수. 관리자·정산 시스템을 안정적으로 짓습니다.', bio: '데이터 모델링과 권한 설계 경험이 많은 빌더입니다. 관리자·정산처럼 틀리면 안 되는 시스템을 안정적으로 짓는 것이 전문입니다.', focus: '어드민 · 정산 · 권한 설계', stack_tags: ['Supabase', 'RBAC'], done_count: 11, is_featured: false, is_new: false,
    principles: [['데이터 모델이 먼저', '화면보다 테이블을 먼저 그립니다. 구조가 맞으면 화면은 따라옵니다.'], ['권한은 처음부터', 'RBAC는 나중에 붙이면 늦습니다. 설계 단계에서 역할과 경계를 확정합니다.'], ['운영자도 사용자', '어드민을 쓰는 운영자의 하루를 기준으로 화면을 짭니다.']],
    extra_link: null, avatar_url: '/assets/img/av-dohyun.jpg', projects: ['nice', 'aerok-admin', 'markspon'] },
  yuna: { name: '빌더 유나', role_label: 'AI 서비스 · 에이전트', one_liner: 'LLM 연동·프롬프트 설계를 실무로 다룹니다. PoC부터 단계 검증으로 리스크를 줄입니다.', bio: 'LLM 연동과 프롬프트 설계를 실무로 다루는 빌더입니다. 전면 도입 대신 PoC부터 단계 검증으로 리스크를 줄이며 AI 서비스를 만듭니다.', focus: 'LLM 연동 · 에이전트 · PoC', stack_tags: ['Agents', 'RAG'], done_count: 7, is_featured: false, is_new: false,
    principles: [['PoC로 먼저 증명', '전면 도입 전에 실데이터로 작게 검증합니다. 판단 근거를 만드는 것이 먼저입니다.'], ['AI의 경계를 정직하게', 'AI가 잘하는 범위를 긋고, 나머지는 사람에게 넘기는 구조로 설계합니다.'], ['프롬프트도 코드처럼', '버전 관리와 평가 없이 배포하지 않습니다.']],
    extra_link: null, avatar_url: '/assets/img/av-yuna.jpg', projects: ['daisy', 'canape'] },
  hajun: { name: '빌더 하준', role_label: '모바일 앱 · 크로스플랫폼', one_liner: '하나의 코드베이스로 iOS·Android를 함께 짓습니다. 스토어 심사·배포까지 책임집니다.', bio: '하나의 코드베이스로 iOS·Android를 함께 짓는 모바일 빌더입니다. 개발에서 끝내지 않고 스토어 심사와 배포, 출시 후 크래시 대응까지를 프로젝트의 범위로 봅니다.', focus: '모바일 앱 · 스토어 출시', stack_tags: ['Flutter', '스토어 배포'], done_count: 6, is_featured: false, is_new: false,
    principles: [['한 코드베이스, 두 플랫폼', 'iOS와 Android를 따로 만들지 않습니다. 유지보수 비용을 절반으로 줄입니다.'], ['심사까지가 개발', '스토어 리젝은 일정의 리스크입니다. 심사 기준을 설계 단계에서 반영합니다.'], ['출시가 시작', '크래시 리포트와 스토어 리뷰를 보며 출시 후 첫 2주를 함께 지킵니다.']],
    extra_link: null, avatar_url: '/assets/img/av-hajun.jpg', projects: ['aerok-user', 'familycare'] },
  sein: { name: '빌더 세인', role_label: '데이터 · 업무 자동화', one_liner: '반복되는 손작업을 파이프라인과 에이전트로 바꿉니다. 데이터가 흐르게 만드는 빌더.', bio: '반복되는 손작업을 파이프라인과 에이전트로 바꾸는 빌더입니다. 흩어진 스프레드시트와 수작업 보고를 자동으로 흐르는 데이터로 만들어, 사람이 판단에만 집중하게 합니다.', focus: '데이터 파이프라인 · 자동화', stack_tags: ['Python', 'n8n'], done_count: 5, is_featured: false, is_new: false,
    principles: [['손이 가면 자동화 대상', '주 1회 이상 반복되는 작업은 전부 자동화 후보로 올립니다.'], ['대시보드보다 알림', '들어가서 봐야 하는 화면보다, 필요할 때 찾아오는 알림을 먼저 만듭니다.'], ['깨져도 티가 나게', '조용히 틀리는 자동화가 최악입니다. 실패는 반드시 드러나게 설계합니다.']],
    extra_link: null, avatar_url: '/assets/img/av-sein.jpg', projects: ['daisy', 'nice'] },
  minseo: { name: '빌더 민서', role_label: '브랜드 · 모션 디자인', one_liner: '디자인 시스템과 모션으로 서비스의 인상을 만듭니다. 개발자가 바로 쓸 수 있는 디자인.', bio: '디자인 시스템과 모션으로 서비스의 인상을 만드는 빌더입니다. 한 장의 예쁜 시안이 아니라, 개발자가 바로 가져다 쓸 수 있는 컴포넌트와 토큰으로 디자인을 전달합니다.', focus: '디자인 시스템 · 모션', stack_tags: ['Design System', 'Motion'], done_count: 4, is_featured: false, is_new: false,
    principles: [['브랜드는 시스템으로', '색·타이포·컴포넌트를 토큰으로 정의해 어디서든 같은 인상을 냅니다.'], ['모션에도 목적', '움직임은 장식이 아니라 안내입니다. 목적 없는 모션은 뺍니다.'], ['개발자가 쓸 수 있게', '시안이 아니라 스펙으로 전달합니다. 디자인과 구현의 간극을 없앱니다.']],
    extra_link: null, avatar_url: '/assets/img/av-minseo.jpg', projects: ['iloom', 'canape'] },
  taeo: { name: '빌더 태오', role_label: '커머스 · 결제', one_liner: 'PG·정기결제 연동과 주문·정산 흐름 설계가 전문. 돈이 오가는 화면을 꼼꼼하게 짓습니다.', bio: 'PG·정기결제 연동과 주문·정산 흐름 설계가 전문인 빌더입니다. 돈이 오가는 화면일수록 예외 케이스가 많다는 것을 알고, 그 예외부터 설계합니다.', focus: '결제 연동 · 주문·정산', stack_tags: ['PG 연동', '구독 결제'], done_count: 8, is_featured: false, is_new: true,
    principles: [['예외부터 설계', '결제는 성공보다 실패·취소·환불이 어렵습니다. 예외 흐름을 먼저 그립니다.'], ['정산은 맞아떨어지게', '1원 차이도 운영 비용입니다. 주문·결제·정산 데이터가 항상 맞물리게 짓습니다.'], ['테스트 결제까지 끝까지', '실 카드 승인·취소 시나리오를 검증하고 나서야 출시라고 부릅니다.']],
    extra_link: null, avatar_url: '/assets/img/av-taeo.jpg', projects: ['iloom', 'markspon'] },
  eunchae: { name: '빌더 은채', role_label: '그로스 · SEO', one_liner: '검색 유입과 콘텐츠 구조를 설계합니다. 만든 뒤에 발견되게 하는 것까지가 일입니다.', bio: '검색 유입과 콘텐츠 구조를 설계하는 빌더입니다. 잘 만든 서비스가 발견되지 않는 것이 가장 아까운 일이라, 만든 뒤에 발견되게 하는 것까지를 일로 봅니다.', focus: '검색 유입 · 콘텐츠 구조', stack_tags: ['SEO', 'Analytics'], done_count: 5, is_featured: false, is_new: true,
    principles: [['구조가 곧 SEO', '키워드보다 정보 구조가 먼저입니다. 검색엔진도 사람처럼 읽기 쉬운 사이트를 좋아합니다.'], ['측정 없이 개선 없음', '유입·전환 데이터를 먼저 깔고, 숫자가 말해주는 순서로 고칩니다.'], ['콘텐츠는 자산으로', '한 번 쓰고 버리는 글이 아니라 계속 유입을 만드는 구조로 쌓습니다.']],
    extra_link: null, avatar_url: '/assets/img/av-eunchae.jpg', projects: ['btv', 'familycare'] },
  junho: { name: '빌더 준호', role_label: '운영 · 인프라', one_liner: '배포 자동화와 모니터링으로 서비스를 지킵니다. 출시 후에도 문제가 먼저 보이게.', bio: '배포 자동화와 모니터링으로 서비스를 지키는 빌더입니다. 출시가 끝이 아니라 시작이라는 것을 알기에, 문제가 고객보다 팀에게 먼저 보이게 만듭니다.', focus: '배포 자동화 · 모니터링', stack_tags: ['CI/CD', '모니터링'], done_count: 3, is_featured: false, is_new: true,
    principles: [['배포는 버튼 하나로', '사람 손을 타는 배포는 사고의 씨앗입니다. 반복 가능한 파이프라인으로 만듭니다.'], ['고객보다 먼저 알기', '장애는 알림으로 먼저 만납니다. 조용히 죽는 서버가 없게 감시를 깔아둡니다.'], ['되돌릴 수 있게', '모든 배포는 롤백 계획과 함께 나갑니다. 되돌릴 수 없는 변경은 하지 않습니다.']],
    extra_link: null, avatar_url: '/assets/img/av-junho.jpg', projects: ['nice', 'aerok-admin'] },
}

/* ── app/insight/view.tsx 의 ARTICLES — 슬러그가 원본에 없어 새로 부여 ── */
const ARTICLES = [
  { slug: 'ai-poc-guide', c: 'ai-ax', img: 'ins-poc.jpg', title: "AI PoC란? 기업 AI 도입 전 반드시 필요한 'PoC' 알아보기", desc: '기업 AI 도입, 전면 구축 전에 PoC로 먼저 검증해야 하는 이유.', date: '2026-08-03' },
  { slug: 'ai-agent-checklist', c: 'ai-ax', img: 'ins-agent.jpg', title: '우리 회사에도 AI 에이전트가 필요할까? 5분 체크리스트', desc: '도입이 필요한 조직의 신호 — 5분 만에 자가진단해 보세요.', date: '2026-07-22' },
  { slug: 'dev-quote-comparison', c: 'guide', img: 'ins-quote.jpg', title: '500만 원 vs 2,000만 원, 개발 외주 견적 비교 제대로 하는 법', desc: '같은 앱인데 견적이 4배 차이 나는 이유를 뜯어봅니다.', date: '2026-07-03' },
  { slug: 'turnkey-team-outsourcing', c: 'guide', img: 'ins-turnkey.jpg', title: '외주개발, 왜 올인원 턴키 팀과 함께 해야 할까?', desc: '기획·디자인·개발을 따로 맡기면 실패하는 구조적 이유.', date: '2026-07-03' },
  { slug: 'ai-adoption-vs-ax', c: 'ai-ax', img: 'ins-ax.jpg', title: 'AI 도입과 AX는 다르다 — 성과를 만드는 업무 설계 3가지', desc: '도입했는데 성과가 없다면, AX와의 결정적 차이를 봐야 합니다.', date: '2026-07-16' },
  { slug: 'toss-minigame-project', c: 'project', img: 'ins-toss.jpg', title: '토스 안에서 미니게임을? 똑똑한개발자 × 앱인토스', desc: '토스와 함께 미니게임을 만든 프로젝트 비하인드.', date: '2026-07-03' },
  { slug: 'ai-native-agency-interview', c: 'how', img: 'ins-native.jpg', title: '기획·디자인·개발을 하나로 — AI 네이티브 에이전시 운영법', desc: "'프로덕트 빌더'로 팀을 운영하는 방식, 빌더 조쉬와의 대화.", date: '2026-04-22' },
  { slug: 'ai-governance-first', c: 'ai-ax', img: 'ins-gov.jpg', title: '기업용 AI 도입, 왜 거버넌스가 먼저 필요할까?', desc: '데이터 유출·통제 불능을 막는 AI 거버넌스 설계법.', date: '2026-07-14' },
]

/* ── app/content/view.tsx 의 CHANNELS/VIDEOS + 하드코딩 피처드 블록 ── */
const CHANNELS = [
  { slug: 'seo-jangwon', name: 'AI 서대표', href: 'https://www.youtube.com/@AISeoceo', sort: 0 },
  { slug: 'kim-iesop', name: '김이솝의 AI 가이드', href: 'https://www.youtube.com/@%EA%B9%80%EC%9D%B4%EC%86%9D%EC%9D%98AI%EA%B0%80%EC%9D%B4%EB%93%9C', sort: 1 },
  { slug: 'toktokhan-dev', name: '똑똑한개발자', href: 'https://www.youtube.com/@toktokhandev', sort: 2 },
]
const CHANNEL_BY_NAME = { 'AI 서대표': 'seo-jangwon', '김이솝의 AI 가이드': 'kim-iesop', '똑똑한개발자': 'toktokhan-dev' }

const VIDEOS = [
  { yt: '0dBSo3eDE-E', ch: '똑똑한개발자', dur: '15:47', title: '2025 똑똑한개발자 상반기 워크샵', sub: '오피셜 · Featured', featured: true },
  { yt: 'kkbtjKvnS-Q', ch: '김이솝의 AI 가이드', dur: '11:11', title: '미친 무료기능 총집합! 제미나이 10분만에 마스터', sub: '조회 44만' },
  { yt: 'ZIn53VIic14', ch: '김이솝의 AI 가이드', dur: '7:57', title: 'AI 동물 인터뷰 쇼츠 만들기 7분만에 끝!', sub: '조회 36만' },
  { yt: '8uif-Wf65SI', ch: '김이솝의 AI 가이드', dur: '18:38', title: '12시간씩 클로드 코드 쓰고 깨달은 핵심 꿀팁 20가지', sub: '조회 5.1천 · NEW' },
  { yt: 'TP6ArUCnt8c', ch: '똑똑한개발자', dur: '15:47', title: '잘봐 이게 컨퍼런스다 — 똑똑한개발자 × 원티드', sub: '브이로그' },
  { yt: 'LjrO4urq5gI', ch: 'AI 서대표', dur: '23:40', title: '10년차 IT 에이전시 대표가 푸는 개발 외주의 모든 것', sub: '예산·견적·계약' },
  { yt: 'gtZPILhrnl8', ch: 'AI 서대표', dur: '13:48', title: '오르카(Orca) 설치부터 AI 블로그 자동화 세팅까지', sub: 'NEW' },
]

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function main() {
  console.log('1) categories 조회...')
  const { data: cats, error: catErr } = await db.from('categories').select('id, slug, type')
  if (catErr) throw catErr
  const catId = (type, slug) => cats.find(c => c.type === type && c.slug === slug)?.id ?? null

  console.log('2) builders upsert...')
  const builderRows = Object.entries(BUILDERS).map(([slug, b]) => ({
    slug,
    name: b.name,
    email: `${slug}@aibuildergroup.local`, // 실제 로그인 계정 없음 — 자리표시자, A-06에서 실계정 발급 시 교체
    role: 'builder',
    one_liner: b.one_liner,
    role_label: b.role_label,
    avatar_url: b.avatar_url,
    is_active: true,
    bio: b.bio,
    focus: b.focus,
    stack_tags: b.stack_tags,
    principles: b.principles.map(([title, body]) => ({ title, body })),
    extra_link: b.extra_link,
    is_featured: b.is_featured,
    is_new: b.is_new,
    done_count: b.done_count,
  }))
  const { data: upsertedBuilders, error: bErr } = await db
    .from('builders').upsert(builderRows, { onConflict: 'slug' }).select('id, slug')
  if (bErr) throw bErr
  const builderId = (slug) => upsertedBuilders.find(b => b.slug === slug)?.id ?? null
  console.log(`   ${upsertedBuilders.length}명 upsert 완료`)

  console.log('3) works upsert...')
  const workRows = Object.entries(WORK_PROJECTS).map(([slug, p]) => {
    const owners = Object.entries(BUILDERS).filter(([, b]) => b.projects.includes(slug)).map(([s]) => s)
    return {
      slug,
      title: p.t,
      summary: p.d,
      category_id: catId('work', p.cat),
      hero_url: `/assets/img/${p.img}`,
      thumb_url: `/assets/img/${p.img}`,
      tag_label: p.tag,
      with_partner: p.w,
      status: 'published',
      published_at: `${p.yr}-01-01T00:00:00Z`,
      created_by: owners[0] ? builderId(owners[0]) : null,
    }
  })
  const { data: upsertedWorks, error: wErr } = await db
    .from('works').upsert(workRows, { onConflict: 'slug' }).select('id, slug')
  if (wErr) throw wErr
  const workId = (slug) => upsertedWorks.find(w => w.slug === slug)?.id ?? null
  console.log(`   ${upsertedWorks.length}건 upsert 완료`)

  console.log('4) work_builders upsert...')
  const wbRows = []
  for (const [bSlug, b] of Object.entries(BUILDERS)) {
    b.projects.forEach((wSlug, i) => {
      wbRows.push({ work_id: workId(wSlug), builder_id: builderId(bSlug), role_label: b.role_label, sort: i })
    })
  }
  const { error: wbErr } = await db.from('work_builders').upsert(wbRows, { onConflict: 'work_id,builder_id' })
  if (wbErr) throw wbErr
  console.log(`   ${wbRows.length}행 upsert 완료`)

  console.log('5) insights upsert...')
  const insightRows = ARTICLES.map(a => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.desc,
    body_html: `<p>${escapeHtml(a.desc)}</p>`, // 원본엔 티저만 있음 — 전체 본문은 콘텐츠 공백, 관리자 화면에서 채워야 함
    thumb_url: `/assets/img/ins/${a.img}`,
    category_id: catId('insight', a.c),
    status: 'published',
    published_at: `${a.date}T00:00:00Z`,
  }))
  const { data: upsertedInsights, error: iErr } = await db
    .from('insights').upsert(insightRows, { onConflict: 'slug' }).select('id, slug')
  if (iErr) throw iErr
  console.log(`   ${upsertedInsights.length}건 upsert 완료`)

  console.log('6) channels upsert...')
  const { data: upsertedChannels, error: chErr } = await db
    .from('channels').upsert(CHANNELS, { onConflict: 'slug' }).select('id, slug')
  if (chErr) throw chErr
  const channelId = (slug) => upsertedChannels.find(c => c.slug === slug)?.id ?? null
  console.log(`   ${upsertedChannels.length}개 upsert 완료`)

  console.log('7) videos upsert...')
  // youtube_id 를 유니크 키처럼 써서 멱등 upsert (컬럼 자체엔 unique 제약이 없어 수동 매칭)
  const { data: existingVideos } = await db.from('videos').select('id, youtube_id')
  const videoRows = VIDEOS.map((v, i) => {
    const existing = existingVideos?.find(e => e.youtube_id === v.yt)
    return {
      ...(existing ? { id: existing.id } : {}),
      youtube_id: v.yt,
      channel_id: channelId(CHANNEL_BY_NAME[v.ch]),
      title: v.title,
      subtitle: v.sub,
      duration_label: v.dur,
      is_featured: !!v.featured,
      is_active: true,
      sort: i,
    }
  })
  const { data: upsertedVideos, error: vErr } = await db.from('videos').upsert(videoRows).select('id')
  if (vErr) throw vErr
  console.log(`   ${upsertedVideos.length}건 upsert 완료`)

  console.log('\n완료:')
  console.log(`  builders: ${upsertedBuilders.length} / works: ${upsertedWorks.length} / work_builders: ${wbRows.length} / insights: ${upsertedInsights.length} / channels: ${upsertedChannels.length} / videos: ${upsertedVideos.length}`)
}

main().catch(err => { console.error(err); process.exit(1) })
