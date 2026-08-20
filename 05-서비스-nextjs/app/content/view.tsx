'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, type CSSProperties } from 'react'
import { useRibbonFlow, useDock } from '@/components/fx'
import type { Channel, Video } from '@/lib/data/content'

const durStyle: CSSProperties = {
  position: 'absolute', top: 14, right: 14, zIndex: 3, fontFamily: 'var(--mono)', fontSize: 11,
  letterSpacing: '.1em', background: 'rgba(0,0,0,.55)', color: 'rgba(244,241,234,.85)',
  padding: '5px 10px', borderRadius: 999,
}

export default function ContentView({
  featured,
  grid,
  channels,
}: {
  featured: Video | null
  grid: Video[]
  channels: Channel[]
}) {
  /* 다크 전환은 CSS 가 body:has(.content-dark) 로 판정한다 (아래 main 의 클래스).
     전에는 여기서 body.dark 를 붙였다 뗐는데, 정작 content.css 는 body { … } 를 그냥
     덮어쓰고 있어서 클래스는 아무 역할도 못 했다. 라우트 CSS 는 클라이언트 이동 때
     확실히 언로드되지 않아서, 콘텐츠 페이지를 한 번 열면 다른 페이지까지 어두워졌다.
     마커를 마크업에 두면 서버 렌더 단계부터 맞아 첫 화면 깜빡임도 없다. */

  useRibbonFlow({
    rsC: [
      'YOUTUBE ✳ 김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ ',
      'NEW VIDEO EVERY WEEK ✳ 실전 바이브 코딩 ✳ ',
      '8.4만 크리에이터 ✳ WATCH, THEN BUILD ✳ ',
      '보는 것에서 만드는 것으로 ✳ AI BUILDER GROUP ✳ ',
    ],
  }, { rsC: 5000 })
  useDock('sub')

  /* 유튜브 직행 + UTM — 02-화면설계 P-06: 새 탭으로 실제 이동 + youtube_outbound 이벤트 */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-yt]').forEach(v => {
      v.addEventListener('click', e => {
        e.preventDefault()
        const videoId = v.dataset.videoId
        const utmContent = v.dataset.utm
        const utm = `?utm_source=builder-group&utm_medium=content&utm_campaign=${videoId}&utm_content=${utmContent}`
        window.track?.('youtube_outbound', { video_id: videoId, utm_campaign: videoId })
        window.open(`https://www.youtube.com/watch?v=${videoId}${utm}`, '_blank', 'noopener,noreferrer')
      })
    })
  }, [])

  return (
    <>
      <main id="main" className="grain content-dark">
        <div className="page-head">
          <div className="wrap">
            <h1><span className="w300">영상으로 보는</span> 우리의 작업</h1>
            <p>김이솝의 AI 가이드 · 똑똑한개발자 · AI 서대표 — 세 채널의 실전 콘텐츠</p>
          </div>
        </div>

        {/* v19: 이음새 리본 — 페이지 헤드 ↔ 영상 그리드 (다크 위 라임) */}
        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice">
            <path id="rsC" d="M -80,100 C 220,15 480,185 780,100 C 1080,15 1340,185 1700,100" fill="none" />
            <use href="#rsC" className="edge" />
            <use href="#rsC" className="lane" />
            <text>
              <textPath href="#rsC" data-wflow data-unit="4" data-speed="0.02">YOUTUBE ✳ 김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ YOUTUBE ✳ 김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ </textPath>
            </text>
          </svg>
        </div>

        <section>
          <div className="wrap">
            {!featured && grid.length === 0 ? (
              <div className="empty">
                <h3>영상을 준비 중입니다</h3>
                <p>곧 새 영상으로 찾아뵐게요 — 그 사이 채널에서 지난 영상을 확인해보세요.</p>
                {channels[0] && (
                  <a className="btn btn--ghost btn--sm" href={channels[0].href} target="_blank" rel="noopener noreferrer">
                    유튜브 채널 가기 ↗
                  </a>
                )}
              </div>
            ) : (
              <>
                {featured && (
                  /* 피처드 (관리자 지정 1건, 없으면 최신 영상 — lib/data/content.ts 폴백) */
                  <a className="vcell feat" href="#" data-yt data-video-id={featured.youtubeId} data-utm="featured">
                    {/* 피처드는 이 화면의 LCP 요소다 — 지연 로드하지 않고 우선순위를 올린다 */}
                    <Image className="vimg" src={`https://i.ytimg.com/vi/${featured.youtubeId}/hqdefault.jpg`} alt="" fill sizes="(max-width: 900px) 100vw, 60vw" priority />
                    <div className="vshade"></div>
                    {featured.channelName && <span className="chbadge">{featured.channelName}</span>}
                    {featured.durationLabel && <span className="dur" style={durStyle}>{featured.durationLabel}</span>}
                    <div className="play"><i>▶</i></div>
                    <div className="cap"><b>{featured.title}</b>{featured.subtitle && <span>{featured.subtitle}</span>}</div>
                  </a>
                )}

                <div className="vg">
                  {grid.map(v => (
                    <a className="vcell" href="#" data-yt data-video-id={v.youtubeId} data-utm="grid" key={v.id}>
                      {/* 그리드는 전부 첫 화면 아래 — 외부(i.ytimg.com) 이미지를 선점하지 않게 */}
                      <Image className="vimg" src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" fill sizes="(max-width: 900px) 50vw, 300px" />
                      <div className="vshade"></div>
                      {v.channelName && <span className="chbadge">{v.channelName}</span>}
                      {v.durationLabel && <span className="dur" style={durStyle}>{v.durationLabel}</span>}
                      <div className="play"><i>▶</i></div>
                      <div className="cap"><b>{v.title}</b>{v.subtitle && <span>{v.subtitle}</span>}</div>
                    </a>
                  ))}
                </div>
              </>
            )}

            <div className="sub-banner">
              <div>
                <h3>채널을 구독하면 새 영상을 놓치지 않아요</h3>
                <p>세 채널에서 매주 실전 바이브 코딩 콘텐츠가 올라옵니다.</p>
              </div>
              <nav className="channel-tabs" aria-label="유튜브 채널">
                {channels.map(channel => (
                  <a className="channel-tab" href={channel.href} target="_blank" rel="noopener noreferrer" data-track="youtube_channel_click" data-location={`content_${channel.slug}`} key={channel.slug}>
                    {channel.name}<span aria-hidden="true">↗</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </section>
      </main>

      {/* 플로팅 CTA 독 */}
      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>무료 문의 — 부담 없이 남겨보세요</span></div>
        <Link className="btn btn--lime btn--sm" href="/contact" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></Link>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>
    </>
  )
}
