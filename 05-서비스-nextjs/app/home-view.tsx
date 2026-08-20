'use client'

import Link from 'next/link'
import { useEffect, type CSSProperties } from 'react'
import { useRibbonFlow, useReplayOnView, useAccordion } from '@/components/fx'
import FaqList from '@/components/FaqList'
import type { FaqTopic } from './_faq'
import type { WorkCard, InsightCard } from '@/lib/types'
import type { Video } from '@/lib/data/content'

/* 스테퍼 점등 순서를 CSS 변수로 넘긴다 (CSS 커스텀 속성이라 캐스트가 필요하다) */
const step = (i: number) => ({ '--i': i }) as CSSProperties

/* ── 히어로 스트림 블록 데이터 (원본 index.html 열 1·2·3, 6블록 ×2 루프) ── */
type Block =
  | { kind: 'shot'; h: number; url: string; img: string; alt: string }
  | { kind: 'duo'; h: number; a: string; b: string }

const shot = (h: number, url: string, img: string, alt: string): Block => ({ kind: 'shot', h, url, img, alt })
const duo = (h: number, a: string, b: string): Block => ({ kind: 'duo', h, a, b })

const COL1: Block[] = [
  shot(196, 'toktokhan.dev', 'ref-toktokhan.jpg', '똑똑한개발자 메인 화면'),
  duo(234, 'm-kream.png', 'm-codle.png'),
  shot(200, 'toss.im', 'ref-toss.jpg', '토스 메인 화면'),
  duo(228, 'm-kakaobank.png', 'm-29cm.png'),
  shot(198, 'kakaobank.com', 'ref-kakaobank.jpg', '카카오뱅크 서비스 화면'),
  shot(192, 'daangn.com', 'ref-daangn.jpg', '당근 메인 화면'),
]
const COL2: Block[] = [
  shot(200, 'builderschool.ai', 'ref-builderschool.jpg', 'AI빌더스쿨 메인 화면'),
  duo(230, 'm-builderschool.png', 'm-aidt.png'),
  shot(196, '29cm.co.kr', 'ref-29cm.jpg', '29CM 메인 화면'),
  shot(198, 'ai.codle.io', 'ref-codle.jpg', '코들 메인 화면'),
  shot(194, 'zigbang.com', 'ref-zigbang.jpg', '직방 메인 화면'),
  duo(232, 'm-29cm.png', 'm-kream.png'),
]
const COL3: Block[] = [
  shot(176, 'zigbang.com', 'ref-zigbang.jpg', '직방 메인 화면'),
  duo(208, 'm-aidt.png', 'm-kakaobank.png'),
  shot(172, 'daangn.com', 'ref-daangn.jpg', '당근 메인 화면'),
  shot(176, '29cm.co.kr', 'ref-29cm.jpg', '29CM 메인 화면'),
  duo(206, 'm-codle.png', 'm-builderschool.png'),
  shot(176, 'toss.im', 'ref-toss.jpg', '토스 메인 화면'),
]

function StreamBlock({ b }: { b: Block }) {
  if (b.kind === 'shot') {
    return (
      <div className="sc slot" style={{ height: b.h }}>
        <div className="bf">
          <div className="bf__bar"><i></i><i></i><i></i><span className="url">{b.url}</span></div>
          <img className="shot" src={`/assets/img/${b.img}`} alt={b.alt} />
        </div>
        <div className="shotshade"></div>
      </div>
    )
  }
  return (
    <div className="sc sc--duo slot" style={{ height: b.h }}>
      <img src={`/assets/img/${b.a}`} alt="" />
      <img src={`/assets/img/${b.b}`} alt="" />
    </div>
  )
}

function StreamCol({ blocks, cls }: { blocks: Block[]; cls: string }) {
  return (
    <div className={cls}>
      <div className="col-in">
        {[...blocks, ...blocks].map((b, i) => <StreamBlock key={i} b={b} />)}
      </div>
    </div>
  )
}

/* ── 라우렐 잎 SVG ── */
function Lv({ r = false }: { r?: boolean }) {
  return (
    <svg className={r ? 'lv lv--r' : 'lv'} viewBox="0 0 36 76" aria-hidden="true">
      <path d="M31 70 C15 60 9 44 12 22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <g fill="currentColor">
        <ellipse cx="24.5" cy="66" rx="8" ry="3" transform="rotate(128 24.5 66)" />
        <ellipse cx="16.3" cy="56.5" rx="8" ry="3" transform="rotate(142 16.3 56.5)" />
        <ellipse cx="10.8" cy="45" rx="8" ry="3" transform="rotate(158 10.8 45)" />
        <ellipse cx="8" cy="32.4" rx="8" ry="3" transform="rotate(174 8 32.4)" />
        <ellipse cx="8.1" cy="19.8" rx="7.6" ry="2.8" transform="rotate(190 8.1 19.8)" />
        <ellipse cx="10.9" cy="8.2" rx="6.8" ry="2.6" transform="rotate(206 10.9 8.2)" />
        <ellipse cx="14" cy="3" rx="5" ry="2.1" transform="rotate(230 14 3)" />
      </g>
    </svg>
  )
}

/* top/big/sub 텍스트는 site_content(trust.laurelN_*)에서 온다 — 구조(라우렐 개수·색)만 고정 */
const LAUREL_SHAPE = [
  { box: 'laurbox rv', cls: 'laur laur--blue', key: 'laurel1' },
  { box: 'laurbox rv d1', cls: 'laur laur--gold laur--wide', key: 'laurel2' },
  { box: 'laurbox rv d2', cls: 'laur laur--ink', key: 'laurel3' },
]

/* ── 브랜드 로고월 ── */
const BRANDS1: [string, string][] = [
  ['asiana', '아시아나IDT'], ['appsintoss', 'apps in toss'], ['bluegarage', 'BLUE GARAGE'],
  ['nhnacademy', 'NHN ACADEMY'], ['woowa', '우아한형제들'], ['kakao', 'kakao'], ['tmoney', 'Tmoney'],
  ['kt', 'kt'], ['hanssem', '한샘'], ['hhi', '현대중공업'], ['aerok', 'Aerok'], ['skbio', 'SK바이오사이언스'],
]
const BRANDS2: [string, string][] = [
  ['shinhan', '신한은행'], ['nice', 'NICE정보통신'], ['linegames', 'LINE GAMES'], ['ksoe', '한국조선해양'],
  ['fastfive', 'FASTFIVE'], ['millie', '밀리의서재'], ['kyobo', '교보문고'], ['kmong', '크몽'],
  ['riiid', 'Riiid'], ['sm', 'SM Entertainment'], ['krafton', 'KRAFTON'],
]

function Bset({ brands }: { brands: [string, string][] }) {
  return (
    <div className="bset">
      {brands.map(([file, alt]) => (
        <img key={file} src={`/assets/img/brands/${file}.png`} alt={alt} loading="lazy" />
      ))}
    </div>
  )
}

export default function HomeView({
  faqHome,
  content,
  previewWorks,
  previewInsights,
  previewFeatured,
  previewSideVideos,
}: {
  faqHome: FaqTopic[]
  content: Record<string, string>
  previewWorks: WorkCard[]
  previewInsights: InsightCard[]
  previewFeatured: Video | null
  previewSideVideos: Video[]
}) {
  const t = (key: string) => content[key] ?? ''

  /* v19.5 이음새 리본 — 문구 덱 로테이션(페이드 전환) + 곡선 흐름.
     구현은 components/fx.ts 의 useRibbonFlow 한 곳으로 모았다 — 전에는 같은 스크립트가
     여기에 통째로 복제돼 있어서 성능 수정을 두 군데 해야 했다.
     문구는 site_content 에서 온다(관리자 화면 "홈" 에서 편집) — SVG textPath 의 no-JS
     폴백도 같은 값(줄1)에서 파생시켜서 두 곳이 따로 놀지 않게 한다. */
  const ribbonA = [t('ribbon_a.line1'), t('ribbon_a.line2'), t('ribbon_a.line3'), t('ribbon_a.line4')]
  const ribbonB = [t('ribbon_b.line1'), t('ribbon_b.line2'), t('ribbon_b.line3'), t('ribbon_b.line4')]
  useRibbonFlow({ rsepA: ribbonA, rsepB: ribbonB }, { rsepA: 5200, rsepB: 4500 })
  /* 0.85 — 스테퍼가 화면에 거의 다 들어왔을 때 시작한다. 낮게 잡으면 아직 화면 끄트머리에
     있을 때 재생이 끝나서, 정작 눈이 갔을 땐 이미 다 켜져 있다. */
  useReplayOnView('[data-stepflow]', 'lit', 0.85)
  useAccordion('.wg', '.wcard')

  /* S2 스크롤 연동 · S3 자동 순환 · S5 탭 · 모바일 캐러셀 · S6 패럴랙스 · S8 퍼짐 전환 · S9 FAQ */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 900px)')
    const cleanups: (() => void)[] = []

    /* S2 */
    const warns = document.querySelectorAll('[data-warn]')
    const s2now = document.querySelector('[data-s2now]')
    const s2Update = () => {
      /* v22: 모바일에서도 스크롤 연동 동작 — 모바일은 화면 아래쪽(72%)에서 전환 */
      const mid = window.innerHeight * (mobile.matches ? 0.72 : 0.55)
      let act = 0
      warns.forEach((w, i) => {
        const r = w.getBoundingClientRect()
        const on = r.top < mid && r.bottom > mid * 0.5
        w.classList.toggle('active', on)
        if (on) act = i
      })
      if (s2now) s2now.textContent = '0' + (act + 1)
      document.querySelectorAll('[data-ic]').forEach((ic, j) => ic.classList.toggle('on', j === act))
    }
    window.addEventListener('scroll', s2Update, { passive: true })
    s2Update()
    cleanups.push(() => window.removeEventListener('scroll', s2Update))

    /* S3: 자동 순환 스텝 — 클릭 전환 + 호버 일시정지 */
    const steps = document.querySelectorAll('[data-steps] .step')
    const s3now = document.querySelector('[data-s3now]')
    if (steps.length) {
      let si = 0
      let s3timer = 0
      const setStep = (n: number) => {
        si = n
        steps.forEach((s, j) => s.classList.toggle('on', j === n))
        if (s3now) s3now.textContent = '0' + (n + 1)
      }
      const startS3 = () => { s3timer = window.setInterval(() => setStep((si + 1) % steps.length), 3600) }
      const stopS3 = () => clearInterval(s3timer)
      startS3()
      const sg = document.querySelector('[data-steps]') as HTMLElement
      sg.addEventListener('mouseenter', stopS3)
      sg.addEventListener('mouseleave', startS3)
      steps.forEach((s, j) => s.addEventListener('click', () => setStep(j)))
      cleanups.push(() => { clearInterval(s3timer); sg.removeEventListener('mouseenter', stopS3); sg.removeEventListener('mouseleave', startS3) })
    }

    /* S5 모바일 탭 — 한 번에 한 장만 펼친다 */
    const openOnly = (card: Element | null) =>
      document.querySelectorAll('.mcard').forEach(x => x.classList.toggle('open', x === card))
    document.querySelectorAll('.mcard').forEach(c => {
      c.addEventListener('click', () => {
        if (!mobile.matches) return
        openOnly(c.classList.contains('open') ? null : c)
      })
    })

    /* v22: 모바일 캐러셀 탭 슬라이드 — 검수(S4)·매칭(S5) 공용.
       기준을 960 → 900px 로 내렸다. 상세 토글과 그 CSS 는 900px 기준인데 캐러셀만 960 이라,
       901~960px 구간에서는 캐러셀이 탭을 가로채는데 토글은 꺼져 있어 카드가 아예 안 열렸다. */
    const cmq = window.matchMedia('(max-width: 900px)')
    const isAtSnap = (grid: Element, card: Element) => {
      const pad = parseFloat(getComputedStyle(grid).scrollPaddingLeft) || 0
      return Math.abs(card.getBoundingClientRect().left - grid.getBoundingClientRect().left - pad) < 24
    }
    const slideTo = (card: Element) => card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    const s4grid = document.querySelector('.s4x__grid')
    if (s4grid) {
      const s4cards = Array.prototype.slice.call(s4grid.querySelectorAll('.s4x-card')) as Element[]
      s4cards.forEach((card, i) => {
        card.addEventListener('click', () => {
          if (!cmq.matches) return
          slideTo(isAtSnap(s4grid, card) ? s4cards[(i + 1) % s4cards.length] : card)
        })
      })
    }
    const s5grid = document.querySelector('.s5 .g3')
    if (s5grid) {
      const s5tap = (e: Event) => {
        if (!cmq.matches) return
        const card = (e.target as Element).closest('.mcard')
        if (!card || isAtSnap(s5grid, card)) return /* 정렬된 카드 탭은 기존 상세 토글로 */
        e.stopPropagation()
        slideTo(card)
        /* 끌어오기만 하고 끝내면 '눌렀는데 설명이 안 나온다'가 된다. 실제로 그랬다 —
           화면 밖 카드는 탭이 여기서 막혀 카드 자신의 토글까지 도달하지 못했다.
           끌어오면서 같이 펼친다. */
        openOnly(card)
      }
      s5grid.addEventListener('click', s5tap, true)
      cleanups.push(() => s5grid.removeEventListener('click', s5tap, true))
    }

    /* S6 패럴랙스 */
    const pars = document.querySelectorAll<HTMLElement>('.wcard .par')
    const parUpdate = () => {
      if (reduced || mobile.matches) return
      pars.forEach(p => {
        const slot = p.closest('.slot')
        if (!slot) return
        const r = slot.getBoundingClientRect()
        const t = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight
        p.style.transform = 'translateY(' + t * 24 + 'px)'
      })
    }
    window.addEventListener('scroll', parUpdate, { passive: true })
    parUpdate()
    cleanups.push(() => window.removeEventListener('scroll', parUpdate))

    /* S8 퍼짐 전환 */
    const ov = document.querySelector('[data-ov]') as HTMLElement | null
    const goTimers: number[] = []
    document.querySelectorAll('[data-expand]').forEach(v => {
      v.addEventListener('click', () => {
        window.track?.('youtube_outbound', { utm: 'utm_source=builder-group&utm_medium=content' })
        if (reduced || !ov) { window.location.href = '/content'; return }
        const r = v.getBoundingClientRect()
        ov.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;opacity:1;'
        requestAnimationFrame(() => {
          ov.classList.add('go')
          ov.style.cssText += 'left:0;top:0;width:100vw;height:100vh;'
        })
        goTimers.push(window.setTimeout(() => { window.location.href = '/content' }, 520))
      })
    })
    cleanups.push(() => goTimers.forEach(t => clearTimeout(t)))


    return () => cleanups.forEach(fn => fn())
  }, [])

  /* 플로팅 독 — 스크롤 진입 후 표시, 최종 CTA·푸터 근처/닫기 시 숨김 */
  useEffect(() => {
    const dock = document.querySelector('[data-dock]')
    if (!dock) return
    let closed = false
    try { closed = sessionStorage.getItem('dock') === '1' } catch {}
    const xbtn = document.querySelector('[data-dock-x]') as HTMLElement
    const reopen = document.querySelector('[data-dock-open]') as HTMLElement | null
    const syncReopen = () => { if (reopen) reopen.classList.toggle('show', closed) }
    const endEl = document.querySelector('.s10') || document.querySelector('.cta-banner') || document.querySelector('footer')
    const upd = () => {
      if (closed) return
      const nearEnd = !!endEl && endEl.getBoundingClientRect().top < window.innerHeight * 0.9
      dock.classList.toggle('show', window.scrollY > window.innerHeight * 0.85 && !nearEnd)
    }
    const onClose = () => {
      closed = true
      dock.classList.remove('show')
      try { sessionStorage.setItem('dock', '1') } catch {}
      syncReopen()
    }
    const onReopen = () => {
      closed = false
      try { sessionStorage.removeItem('dock') } catch {}
      syncReopen(); upd()
    }
    xbtn.addEventListener('click', onClose)
    if (reopen) reopen.addEventListener('click', onReopen)
    window.addEventListener('scroll', upd, { passive: true })
    upd(); syncReopen()
    return () => {
      window.removeEventListener('scroll', upd)
      xbtn.removeEventListener('click', onClose)
      if (reopen) reopen.removeEventListener('click', onReopen)
    }
  }, [])

  return (
    <>
      <main id="main" style={{ paddingTop: 0 }}>

        {/* ===== S1 Hero — 스트림: 데스크톱 실물 + 모바일 듀오 교차 ===== */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true"></div>
          <div className="hero-real"><i>✓</i>{t('hero.badge')}</div>

          <div className="streamwrap" aria-hidden="true">
            <div className="stream">
              <StreamCol blocks={COL1} cls="col" />
              <StreamCol blocks={COL2} cls="col col--rev" />
              <StreamCol blocks={COL3} cls="col col--slow" />
            </div>
          </div>

          <div className="wrap hero__in">
            <span className="h1-over"><i>✓</i><em>{t('hero.overline')}</em></span>
            <h1 className="st st1"><span className="w300">{t('hero.title_1')}</span><br /><mark>{t('hero.title_mark')}</mark>{t('hero.title_suffix')}</h1>
            <p className="st st2">{t('hero.subhead_1')}<br />
              {t('hero.subhead_2')}</p>
            <div className="st st3 hero-ctas">
              <Link className="btn btn--ink btn--pulse" href="/contact" data-track="cta_click" data-location="hero">{t('hero.cta_primary')} <span className="arr">→</span></Link>
              <Link className="cta-sub" href="/work" data-track="cta_click" data-location="hero_secondary">{t('hero.cta_secondary')} <span className="arr">→</span></Link>
            </div>
            <p className="st st3 hero-proof"><a className="proof-link" href="#builders">{t('hero.proof_builders_label')} <b className="num">{t('hero.proof_builders_num')}</b>인</a><i></i><a className="proof-link" href="#work">{t('hero.proof_work_label')} <b className="num">{t('hero.proof_work_num')}</b>건</a><i></i><a className="proof-link" href="#system"><b>{t('hero.proof_system_label')}</b> 운영</a></p>
          </div>
          <div className="hero__scroll">{t('hero.scroll_label')}</div>
        </section>

        {/* v19: 이음새 리본 A — 히어로 ↔ 검수 시스템 (잉크 리본 · 서비스 키워드) */}
        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice">
            <path id="rsepA" d="M -80,132 C 220,20 480,244 780,132 C 1080,20 1340,244 1700,132" fill="none" />
            <use href="#rsepA" className="edge2" />
            <use href="#rsepA" className="lane2" />
            <text className="t2">
              <textPath href="#rsepA" data-wflow data-unit="5" data-speed="0.026" data-dir="rev">{ribbonA[0]}{ribbonA[0]}</textPath>
            </text>
          </svg>
        </div>

        {/* ===== S4 v10 — 아이코닉 카드 (정지 구간) ===== */}
        <section className="s4x" id="system">
          <div className="wrap">
            <div className="s4x__head">
              <h2><mark>{t('trust.title_mark')}</mark> {t('trust.title_line1')}<br />{t('trust.title_line2')}</h2>
            </div>
            <div className="s4x__grid">
              {LAUREL_SHAPE.map(l => (
                <div className={l.box} key={l.key}>
                  <div className={l.cls}>
                    <Lv />
                    <span className="laur__txt"><span className="l-star">✦</span><span className="l-top">{t(`trust.${l.key}_top`)}</span><b>{t(`trust.${l.key}_big`)}</b><span className="l-sub">{t(`trust.${l.key}_sub`)}</span></span>
                    <Lv r />
                  </div>
                </div>
              ))}
              <div className="s4x-card rv">
                <div className="vis2 v2--edu">
                  <img className="v2-person" src="/assets/img/p-kiesop.png" alt="김이솝" />
                  <div className="ic-pill ic-pill--side"><span className="spark">✦</span>{t('trust.card1_pill')}<span className="ok">✓</span></div>
                </div>
                <div className="bd2"><b>{t('trust.card1_heading')}</b><span>{t('trust.card1_desc')}<mark>{t('trust.card1_mark')}</mark></span></div>
              </div>
              <div className="s4x-card rv d1">
                <div className="vis2 v2--sys">
                  <div className="v2-tok"><span>+ O ✳</span><em>(주)똑똑한개발자</em></div>
                  <div className="ic-team">
                    <span className="bub">{t('trust.card2_bubble')}</span>
                    <div className="avs"><i>조</i><i>리</i><i className="core">✳</i><i>도</i><i className="more">+24</i></div>
                  </div>
                </div>
                <div className="bd2"><b>{t('trust.card2_heading')}</b><span>{t('trust.card2_desc')}<mark>{t('trust.card2_mark')}</mark></span></div>
              </div>
              <div className="s4x-card rv d2">
                <div className="vis2 v2--match">
                  <img className="v2-kmong" src="/assets/img/p-kmong.png" alt="크몽" />
                  <div className="ic-match ic-match--side">
                    <div className="chip2"><i>유</i><div><b>{t('trust.card3_builder_name')}</b><span>{t('trust.card3_builder_role')}</span></div></div>
                    <span className="done">{t('trust.card3_badge')}</span>
                  </div>
                </div>
                <div className="bd2"><b>{t('trust.card3_heading')}</b><span>{t('trust.card3_desc')}<mark>{t('trust.card3_mark')}</mark></span></div>
              </div>
            </div>
            {/* --i = 점등 순서. 사이의 .fline 까지 한 칸씩 세므로 0,1,2,… 로 이어 붙인다.
                nth-child 로 세면 선까지 섞여 순서가 어긋난다. */}
            <div className="sys__flow2" data-stepflow aria-label="검증 프로세스" style={{ marginTop: 72 }}>
              <span className="fstep" style={step(0)}><span className="dot">01</span><span className="lb2">{t('trust.flow1_label')}<small>{t('trust.flow1_sub')}</small></span></span>
              <span className="fline" style={step(1)}></span>
              <span className="fstep" style={step(2)}><span className="dot">02</span><span className="lb2">{t('trust.flow2_label')}<small>{t('trust.flow2_sub')}</small></span></span>
              <span className="fline" style={step(3)}></span>
              <span className="fstep" style={step(4)}><span className="dot">03</span><span className="lb2">{t('trust.flow3_label')}<small>{t('trust.flow3_sub')}</small></span></span>
              <span className="fline" style={step(5)}></span>
              <span className="fstep fstep--last" style={step(6)}><span className="dot">✓</span><span className="lb2">{t('trust.flow4_label')}<small>{t('trust.flow4_sub')}</small></span></span>
            </div>
          </div>
        </section>

        {/* ===== S4b 파트너 실적 — 로고월 + 스탯 ===== */}
        <section className="s4b">
          <div className="wrap">
            <div className="s4x__brands">
              <h3>{t('partner.title_1')}<br />{t('partner.title_2')}</h3>
              <p className="bsub">{t('partner.subtitle')}</p>
              <p className="bcta"><mark>{t('partner.cta_mark')}</mark></p>
              <div className="bwall">
                <div className="brow"><div className="btrack"><Bset brands={BRANDS1} /><Bset brands={BRANDS1} /></div></div>
                <div className="brow"><div className="btrack btrack--rev"><Bset brands={BRANDS2} /><Bset brands={BRANDS2} /></div></div>
              </div>
            </div>
            <div className="s4x__stats" style={{ marginTop: 36 }}>
              <span className="st2"><b>{t('partner.stat1_num')}<em>{t('partner.stat1_unit')}</em></b><span>{t('partner.stat1_label')}</span></span>
              <span className="st2"><b>{t('partner.stat2_num')}<em>{t('partner.stat2_unit')}</em></b><span>{t('partner.stat2_label')}</span></span>
              <span className="st2"><b>{t('partner.stat3_num')}<em>{t('partner.stat3_unit')}</em></b><span>{t('partner.stat3_label')}</span></span>
              <span className="st2"><b>{t('partner.stat4_num')}<em>{t('partner.stat4_unit')}</em></b><span>{t('partner.stat4_label')}</span></span>
            </div>
          </div>
        </section>

        {/* ===== S2 문제 제기 v8 — Fixed + 스크롤 연동 ===== */}
        <section className="s2">
          <div className="wrap">
            <div className="s2__grid">
              <div className="s2__left">
                <h2>{t('problem.title_1')}<br />{t('problem.title_2')}</h2>
                <p className="note">{t('problem.note')}</p>
                <div className="s2__icons" aria-hidden="true">
                  <span data-ic><svg viewBox="0 0 24 24"><rect x="2.5" y="3.5" width="19" height="17" rx="2.5" fill="#FFFFFF" stroke="#0E0E0C" strokeWidth="1.6" /><path d="M2.5 6a2.5 2.5 0 0 1 2.5-2.5h14a2.5 2.5 0 0 1 2.5 2.5v2.5h-19z" fill="#2F80EA" stroke="#0E0E0C" strokeWidth="1.6" /><circle cx="5.8" cy="6" r=".9" fill="#FFFFFF" /><circle cx="8.6" cy="6" r=".9" fill="#FFFFFF" /><g stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round"><line x1="9.5" y1="12.5" x2="14.5" y2="17.5" /><line x1="14.5" y1="12.5" x2="9.5" y2="17.5" /></g></svg></span>
                  <span data-ic><svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><g stroke="#2F80EA" strokeWidth="2.5"><polyline points="17 2.5 21 6.5 17 10.5" /><path d="M3 11v-.5a4 4 0 0 1 4-4h14" /></g><g stroke="#F5A623" strokeWidth="2.5"><polyline points="7 21.5 3 17.5 7 13.5" /><path d="M21 13v.5a4 4 0 0 1-4 4H3" /></g></svg></span>
                  <span data-ic><svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z" fill="#F5C542" stroke="#0E0E0C" strokeWidth="1.6" /><circle cx="7" cy="7" r="1.5" fill="#FFFFFF" stroke="#0E0E0C" strokeWidth="1.2" /><line x1="10.3" y1="17.7" x2="17.7" y2="10.3" stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" /></svg></span>
                </div>
                <p className="s2__count"><b data-s2now>01</b> / 03</p>
              </div>
              <div className="s2__right">
                <div className="warn warn--a" data-warn>
                  <span className="wnum">01</span>
                  <div>
                    <h3>{t('problem.card1_title1')}<br />{t('problem.card1_title2')}</h3>
                    <p>{t('problem.card1_desc')}<mark>{t('problem.card1_mark')}</mark>입니다.</p>
                  </div>
                  <div className="w-fig w-fig1"><i></i><i></i><i></i><i></i><i className="real"></i><i></i><i></i><i></i><i></i></div>
                </div>
                <div className="warn warn--b" data-warn>
                  <span className="wnum">02</span>
                  <div>
                    <h3>{t('problem.card2_title1')}<br />{t('problem.card2_title2')}</h3>
                    <p>{t('problem.card2_desc')}<mark>{t('problem.card2_mark')}</mark></p>
                  </div>
                  <div className="w-fig w-fig2"><i></i><i></i><i></i></div>
                </div>
                <div className="warn warn--c" data-warn>
                  <span className="wnum">03</span>
                  <div>
                    <h3>{t('problem.card3_title1')}<br />{t('problem.card3_title2')}</h3>
                    <p>{t('problem.card3_desc')}<mark>{t('problem.card3_mark')}</mark>입니다.</p>
                  </div>
                  <div className="w-fig w-fig3"><span className="tagp"><s>-50%</s></span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S3 일하는 방식 v9 — 자동 순환 (클릭 전환 · 호버 일시정지) ===== */}
        <section className="s3 grain" id="how">
          <div className="wrap">
            <div className="s3__head">
              <h2><span className="w300">{t('process.title_1')}</span><br />{t('process.title_2')}</h2>
              <span className="s3__cnt"><b data-s3now>01</b> / 04</span>
            </div>
            <div className="s3__grid" data-steps>
              <div className="step on">
                <span className="no">01</span>
                <h3>{t('process.step1_title')}</h3>
                <p>{t('process.step1_desc')}</p>
                <span className="out">{t('process.step1_output')}</span>
                <div className="bar"><i></i></div>
              </div>
              <div className="step">
                <span className="no">02</span>
                <h3>{t('process.step2_title')}</h3>
                <p>{t('process.step2_desc')}</p>
                <span className="out">{t('process.step2_output')}</span>
                <div className="bar"><i></i></div>
              </div>
              <div className="step">
                <span className="no">03</span>
                <h3>{t('process.step3_title')}</h3>
                <p>{t('process.step3_desc')}</p>
                <span className="out">{t('process.step3_output')}</span>
                <div className="bar"><i></i></div>
              </div>
              <div className="step">
                <span className="no">04</span>
                <h3>{t('process.step4_title')}</h3>
                <p>{t('process.step4_desc')}</p>
                <span className="out">{t('process.step4_output')}</span>
                <div className="bar"><i></i></div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S5 맞춤 매칭 ===== */}
        <section className="s5" id="builders">
          <div className="wrap">
            <div className="s5__head">
              <h2><span className="w300">{t('matching.title_1')}</span><br />{t('matching.title_2')}</h2>
              <Link className="btn btn--ghost s5__cta" href="/work#builders" data-track="cta_click" data-location="match_section">{t('matching.cta_label')} <span className="arr">→</span></Link>
            </div>
            {/* '카드에 마우스를 올려보세요' 안내는 뺐다 — 조작법을 적어두는 건 내부 시연용 문구다.
                호버·탭 반응은 카드 자체가 알려줘야 한다. */}
            <p className="t-lead">{t('matching.lead')}</p>
            <div className="grid g3">
              <div className="mcard mcard--light" tabIndex={0}>
                <div className="bg bgi bgi-1"><span className="mring"></span><svg className="mico" viewBox="0 0 96 96" aria-hidden="true"><rect x="8" y="14" width="80" height="64" rx="10" fill="none" stroke="currentColor" strokeWidth="5" /><line x1="8" y1="32" x2="88" y2="32" stroke="currentColor" strokeWidth="5" /><circle cx="20" cy="23" r="3.2" fill="currentColor" /><circle cx="31" cy="23" r="3.2" fill="currentColor" /><rect x="20" y="42" width="34" height="8" rx="4" fill="currentColor" /><rect x="20" y="56" width="22" height="8" rx="4" fill="currentColor" /><path d="M60 50 L78 65 L69 66.5 L64.5 75 Z" fill="currentColor" /></svg><span className="mdeco md1">✳</span><span className="mdeco md2">✦</span></div>
                <div className="shade"></div>
                <div className="plus">+</div>
                <div className="in">
                  <span className="k">{t('matching.card1_kicker')}</span>
                  <h3>{t('matching.card1_title')}</h3>
                  <p className="sub">{t('matching.card1_sub')}</p>
                  <div className="detail">
                    <p>{t('matching.card1_desc')}</p>
                    <span className="who">{t('matching.card1_who')}</span>
                  </div>
                </div>
              </div>
              <div className="mcard" tabIndex={0}>
                <div className="bg bgi bgi-2"><span className="mring"></span><svg className="mico" viewBox="0 0 96 96" aria-hidden="true"><rect x="8" y="10" width="80" height="76" rx="12" fill="none" stroke="currentColor" strokeWidth="5" /><line x1="34" y1="10" x2="34" y2="86" stroke="currentColor" strokeWidth="5" /><rect x="15" y="22" width="12" height="5" rx="2.5" fill="currentColor" /><rect x="15" y="34" width="12" height="5" rx="2.5" fill="currentColor" /><rect x="15" y="46" width="12" height="5" rx="2.5" fill="currentColor" /><rect x="43" y="52" width="9" height="22" rx="3" fill="currentColor" /><rect x="58" y="40" width="9" height="34" rx="3" fill="currentColor" /><rect x="73" y="28" width="9" height="46" rx="3" fill="currentColor" /></svg><span className="mdeco md1">✦</span><span className="mdeco md2">✳</span></div>
                <div className="shade"></div>
                <div className="plus">+</div>
                <div className="in">
                  <span className="k">{t('matching.card2_kicker')}</span>
                  <h3>{t('matching.card2_title')}</h3>
                  <p className="sub">{t('matching.card2_sub')}</p>
                  <div className="detail">
                    <p>{t('matching.card2_desc')}</p>
                    <span className="who">{t('matching.card2_who')}</span>
                  </div>
                </div>
              </div>
              <div className="mcard mcard--light" tabIndex={0}>
                <div className="bg bgi bgi-3"><span className="mring"></span><svg className="mico" viewBox="0 0 96 96" aria-hidden="true"><g stroke="currentColor" strokeWidth="10" strokeLinecap="round"><line x1="48" y1="14" x2="48" y2="82" /><line x1="19" y1="31" x2="77" y2="65" /><line x1="77" y1="31" x2="19" y2="65" /></g><circle cx="80" cy="16" r="6" fill="currentColor" /></svg><span className="mdeco md1">✦</span><span className="mdeco md2">✳</span></div>
                <div className="shade"></div>
                <div className="plus">+</div>
                <div className="in">
                  <span className="k">{t('matching.card3_kicker')}</span>
                  <h3>{t('matching.card3_title')}</h3>
                  <p className="sub">{t('matching.card3_sub')}</p>
                  <div className="detail">
                    <p>{t('matching.card3_desc')}</p>
                    <span className="who">{t('matching.card3_who')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S6 Work 프리뷰 ===== */}
        <section id="work">
          <div className="wrap">
            <div className="sec-head">
              <h2>{t('work_preview.title')}</h2>
              <Link className="more-link" href="/work">{t('work_preview.more_label')}</Link>
            </div>
            <p className="t-lead">{t('work_preview.lead')}</p>
            {/* 실제 발행된 Work 3건 — /admin/works 에서 편집하면 그대로 반영된다.
                예전엔 가짜 데이터였다(기술 스택 칩에 "실제 프로젝트 사실과 다를 수 있음" 경고 주석이
                붙어 있었다) — 이제 진짜 데이터라 그 문제 자체가 없어졌다. */}
            <div className="wg">
              {previewWorks.map(p => (
                <Link className="wcard" href={`/work/${p.slug}`} data-track="work_card" data-cursor="VIEW →" key={p.slug}>
                  <div className="slot mask">
                    <div className="bf"><div className="bf__bar"><i></i><i></i><i></i><span className="url">{p.slug}</span></div><img className="shot" src={p.thumbUrl ?? ''} alt="" /></div>
                    <div className="par"></div>
                  </div>
                  <div className="meta">
                    <div className="mrow"><span className="tag">{p.tagLabel}</span><span className="yr num">{p.year}</span></div>
                    <h3>{p.title}</h3>
                    <p>{p.summary}</p>
                    {p.withTeamLabel && <div className="builders"><span>{p.withTeamLabel}</span></div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== S7 Insight 프리뷰 — 정지 · 제목 우선 ===== */}
        <section className="s7">
          <div className="wrap">
            <div className="sec-head">
              <h2>{t('insight_preview.title')}</h2>
              <Link className="more-link" href="/insight">{t('insight_preview.more_label')}</Link>
            </div>
            {/* 실제 발행된 Insight 3건 — 예전엔 /insight 목록에서 빌려 온 남의 썸네일(제목이 안 맞는)을
                썼다. /admin/insights 에서 편집하면 그대로 반영된다. */}
            {previewInsights.map(a => (
              <Link className="irow" href={`/insight/${a.slug}`} key={a.slug}>
                <img className="ithumb" src={a.thumbUrl ?? ''} alt="" loading="lazy" decoding="async" />
                <span className="t">{a.title}</span>
                <span className="meta"><span className="tag">{a.categoryName}</span><span className="d num">{a.publishedLabel}</span></span>
              </Link>
            ))}
          </div>
        </section>

        {/* v19: 이음새 리본 B — 인사이트 ↔ 콘텐츠(다크) (라임 리본 · 브랜드 문구) */}
        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice">
            <path id="rsepB" d="M -80,128 C 220,240 480,16 780,128 C 1080,240 1340,16 1700,128" fill="none" />
            <use href="#rsepB" className="edge" />
            <use href="#rsepB" className="lane" />
            <text>
              <textPath href="#rsepB" data-wflow data-unit="4" data-speed="0.02">{ribbonB[0]}{ribbonB[0]}</textPath>
            </text>
          </svg>
        </div>

        {/* ===== S8 콘텐츠·유튜브 ===== */}
        <section className="s8 grain">
          <div className="wrap">
            <div className="sec-head">
              <h2>{t('content_preview.title')}</h2>
              <Link className="more-link" href="/content">{t('content_preview.more_label')}</Link>
            </div>
            <p className="t-lead">{t('content_preview.lead')}</p>
            {/* 피처드 + 최근 영상 2건 — /admin/content 에서 편집하면 그대로 반영된다. */}
            <div className="vgrid">
              {previewFeatured && (
                <div className="vcell slot" data-expand data-track="youtube_outbound" data-slug="featured">
                  <img className="vimg" src={`https://i.ytimg.com/vi/${previewFeatured.youtubeId}/hqdefault.jpg`} alt={previewFeatured.title} loading="lazy" />
                  <div className="vshade"></div>
                  {previewFeatured.durationLabel && <span className="dur num">{previewFeatured.durationLabel}</span>}
                  <div className="play"><i>▶</i></div>
                  <div className="cap"><b>{previewFeatured.title}</b>{previewFeatured.channelName && <span>{previewFeatured.channelName}</span>}</div>
                </div>
              )}
              <div className="vside">
                {previewSideVideos.map(v => (
                  <div className="vcell slot" data-expand style={{ aspectRatio: '16/8' }} key={v.id}>
                    <img className="vimg" src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title} loading="lazy" />
                    <div className="vshade"></div>
                    {v.durationLabel && <span className="dur num">{v.durationLabel}</span>}
                    <div className="play"><i>▶</i></div>
                    <div className="cap"><b>{v.title}</b></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== S9 FAQ ===== */}
        <section className="s9" id="faq">
          <div className="wrap">
            <div className="sec-head">
              <h2>{t('faq_preview.title')}</h2>
              <Link className="more-link" href="/faq">{t('faq_preview.more_label')}</Link>
            </div>
            <p className="t-lead">{t('faq_preview.lead')}</p>
            {/* 데이터는 lib/data/faq.ts 에서 온다 — /faq 페이지와 같은 원본(관리자 화면에서 편집) */}
            <FaqList topics={faqHome} />
          </div>
        </section>

        {/* ===== S10 최종 CTA ===== */}
        {/* roomy(176px) 를 뺐다 — 앞 섹션의 아래 여백 136px 과 더해져 312px 이 비었다.
            마무리 CTA 라 위쪽은 조이고 아래(푸터 앞)만 넉넉히 둔다. */}
        <section className="s10">
          <div className="wrap">
            <span className="ast" aria-hidden="true">✳</span>
            <h2><span className="w300">{t('final_cta.title_1')}</span><br />{t('final_cta.title_2')}</h2>
            <p>{t('final_cta.body')}</p>
            <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="footer_cta" style={{ fontSize: 17, padding: '18px 38px' }}>{t('final_cta.button')} <span className="arr">→</span></Link>
          </div>
        </section>

      </main>

      {/* 플로팅 CTA 독 — 히어로 CTA와 화면상 비중복 (히어로/최종CTA 노출 시 숨김) */}
      <div className="dock" data-dock>
        <div className="dock__txt"><b>{t('dock.title')}</b><span>{t('dock.subtitle')}</span></div>
        <Link className="btn btn--lime btn--sm" href="/contact" data-track="cta_click" data-location="floating">{t('dock.button')} <span className="arr">→</span></Link>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>

      <div className="expand-ov" data-ov></div>
    </>
  )
}
