import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { pageMeta, SITE, SITE_URL } from './_meta'
import { GOOGLE_SITE_VERIFICATION, NAVER_SITE_VERIFICATION } from './_integrations'
import './style.css'
import Gnb from '@/components/Gnb'
import Footer from '@/components/Footer'
import SiteFx from '@/components/SiteFx'
import ChannelTalk from '@/components/ChannelTalk'
import GoogleAnalytics from '@/components/GoogleAnalytics'

/* JetBrains Mono 는 Google Fonts 카탈로그에 있어 next/font 로 완전 자체 호스팅한다 —
   style.css 의 @import 를 없애서 Google 로 나가는 렌더 블로킹 요청 자체를 지운다.
   생성된 CSS 변수는 style.css 의 --mono 폴백 체인 맨 앞에 얹는다(선언은 style.css, 여기선
   글꼴 파일만 준비). */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jbm',
  display: 'swap',
})

/* 배포 주소를 코드에 박아두면 안 된다. 실제로 ai-builder-group-pearl(옛 HTML 목업 배포본)이
   박혀 있어서, 이 사이트를 공유해도 og:url · og:image 가 남의 도메인을 가리켰다.
   값은 _meta.ts 의 SITE_URL 하나에서 나온다 — sitemap · robots 도 같은 값을 본다. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /* 나머지 라우트와 같은 조립기를 쓴다 — 값이 한 곳에서만 나온다 */
  ...pageMeta({ title: `${SITE} — 바이브 코딩 외주`, path: '/' }),
  /* 구글 서치콘솔 · 네이버 서치어드바이저 소유 확인. 값이 없으면 필드가 안 나가므로
     연동 전에도 동작은 그대로다 — docs/analytics-seo-setup.md 참고. */
  verification: {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(NAVER_SITE_VERIFICATION ? { other: { 'naver-site-verification': NAVER_SITE_VERIFICATION } } : {}),
  },
}

/* Organization + WebSite 구조화 데이터 — 전 페이지 공통이라 루트에 한 번만 렌더. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: SITE, url: SITE_URL },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, name: SITE, url: SITE_URL, publisher: { '@id': `${SITE_URL}/#org` } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={jetbrainsMono.variable}>
      <head>
        {/* Pretendard — jsdelivr 동적 서브셋(실제 쓰인 한글 음절만 unicode-range 로 받음).
            CSS @import 대신 <link> 로 직접 렌더해야 브라우저 프리로드 스캐너가 HTML 최초
            응답에서 바로 찾는다(@import 는 메인 스타일시트를 다 받은 뒤에야 발견됨).
            style.css 의 --sans 정의는 그대로 — 로드 경로만 앞당긴다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip" href="#main">본문 바로가기</a>
        <Gnb />
        {children}
        <Footer />
        <SiteFx />
        {/* 플러그인 키가 없으면 아무것도 하지 않는다 */}
        <ChannelTalk />
        {/* 측정 ID가 없으면 아무것도 하지 않는다 */}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
