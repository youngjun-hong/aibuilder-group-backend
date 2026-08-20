/** @type {import('next').NextConfig} */
const nextConfig = {
  /* /work-detail·/insight-detail 는 슬러그와 무관한 고정 데모 페이지였다. IA §2.2 가 정의한
     정식 라우트(/work/[slug]·/insight/[slug])로 옮기면서 폐기 — 구 링크는 목록으로 보낸다. */
  async redirects() {
    return [
      { source: '/work-detail', destination: '/work', permanent: true },
      { source: '/insight-detail', destination: '/insight', permanent: true },
    ]
  },
}

export default nextConfig
