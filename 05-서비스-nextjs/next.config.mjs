/** @type {import('next').NextConfig} */
const nextConfig = {
  /* next/image 가 최적화(반응형 srcset·AVIF/WebP 변환)할 수 있는 원격 호스트 허용 목록.
     Supabase Storage 공개 버킷(작업물·인사이트 썸네일, 빌더 아바타)과 유튜브 썸네일. */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
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
