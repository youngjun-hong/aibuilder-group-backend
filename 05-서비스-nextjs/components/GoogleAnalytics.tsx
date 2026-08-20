import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/app/_integrations'

/* GA4. 측정 ID가 비어 있으면 아무것도 렌더링하지 않는다 — ChannelTalk.tsx 와 같은 원칙,
   연동 전에도 사이트는 그대로 동작해야 한다.

   SiteFx.tsx 의 window.track([data-track] 클릭 위임)이 이 스크립트가 만든 window.gtag 를
   호출한다 — 이벤트 배선은 그쪽에 그대로 두고 여기선 라이브러리 로드만 담당한다. */
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
