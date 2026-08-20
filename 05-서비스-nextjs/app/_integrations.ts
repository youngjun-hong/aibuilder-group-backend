/* 외부 서비스 연동 설정 — 값은 전부 환경변수에서 온다.
   소스에 계정값을 박아두면 팀원이 자기 계정으로 바꿀 때 코드를 고쳐야 하고,
   레포가 공개라 값이 그대로 따라 나간다. .env.local 에만 넣고 .env.example 로 형태만 공유한다.

   세 값 모두 비어 있어도 사이트는 그대로 동작한다 — 연동이 꺼진 상태가 정상 기본값이다.
   (Origin 시안에서 지킨 규칙과 같다: 키 없이도 화면이 죽지 않아야 한다) */

/* pluug 리드 폼. 문의 데이터는 우리 DB 에 저장하지 않고 pluug 가 받는다 (README §절대 규칙).
   www 를 붙인 정규 주소를 쓸 것 — pluuug.com/form/... 은 301 로 www 에 넘긴다. */
export const PLUUG_FORM_URL = process.env.NEXT_PUBLIC_PLUUG_FORM_URL ?? ''

/* 채널톡 플러그인 키. 채널톡 > 채널 설정 > 보안 및 개발 > 플러그인 키.
   ⚠ 잘못된 키를 넣으면 boot 콜백이 아예 오지 않는다 (에러도 없다 — Origin 에서 실측).
      키를 바꾼 뒤에는 반드시 런처를 눌러 메신저가 실제로 열리는지 확인할 것. */
export const CHANNEL_PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY ?? ''

/* GA4 측정 ID. GA4 관리 > 데이터 스트림 > 웹 스트림에서 확인.
   비어 있으면 GoogleAnalytics 컴포넌트가 아무 스크립트도 안 넣는다 — 연동 전에도 사이트는 그대로 동작한다. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

/* 구글 서치콘솔 · 네이버 서치어드바이저 소유 확인용 메타태그 값.
   둘 다 서버 컴포넌트(layout.tsx metadata)에서만 읽으므로 NEXT_PUBLIC_ 접두사가 필요 없다.
   비어 있으면 해당 meta 태그 자체가 안 나간다 — docs/analytics-seo-setup.md 참고. */
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION ?? ''
export const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION ?? ''

/* utm_source 는 "우리 사이트에서 왔다"는 뜻이라 고정값이다.
   방문자가 달고 들어온 utm_source 는 덮어쓰지 않고 entry_utm_source 로 따로 넘긴다 —
   둘은 질문이 다르다 (우리가 보낸 트래픽인가 vs 이 사람은 원래 어디서 왔나). */
const UTM_SOURCE = process.env.NEXT_PUBLIC_UTM_SOURCE ?? 'ai-builder-group'

/** 문의 폼 주소에 유입 정보를 붙여 돌려준다. 키가 없으면 빈 문자열. */
export function pluugUrl(section: string, refContent?: string): string {
  if (!PLUUG_FORM_URL) return ''
  let u: URL
  try {
    u = new URL(PLUUG_FORM_URL)
  } catch {
    return ''   /* 주소를 잘못 넣어도 페이지가 죽지는 않게 */
  }
  u.searchParams.set('utm_source', UTM_SOURCE)
  u.searchParams.set('utm_medium', 'website')
  u.searchParams.set('entry_section', section)          // 어느 CTA 가 전환을 만드는가
  if (refContent) u.searchParams.set('ref_content', refContent)
  if (typeof window !== 'undefined') {
    const inbound = new URLSearchParams(location.search).get('utm_source')
    if (inbound) u.searchParams.set('entry_utm_source', inbound)
  }
  return u.toString()
}
