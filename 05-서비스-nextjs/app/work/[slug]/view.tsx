'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { WorkDetail } from '@/lib/types'

/* IA §2.2 가 정의한 정식 상세 라우트. 예전 /work-detail 은 슬러그와 무관한 고정 데모
   페이지 1개였다 — PRD §8.1("화면만 전환하는 구현은 요구사항 미충족") 근거로 폐기하고
   여기로 옮겼다. 마크업·CSS 클래스는 원본 wd-* 구조를 그대로 쓰고, 데이터만 props 로 받는다. */
export default function WorkDetailView({ work }: { work: WorkDetail }) {
  useEffect(() => {
    window.track?.('work_detail_view', { slug: work.slug, category: work.categorySlug ?? '' })
  }, [work.slug, work.categorySlug])

  const acts: { no: string; label: string; body: string | null }[] = [
    { no: '01', label: '문제', body: work.bodyProblem },
    { no: '02', label: '해결', body: work.bodySolution },
    { no: '03', label: '결과', body: work.bodyResult },
  ].filter(a => a.body)

  return (
    <main id="main">
      <div className="wrap wd-head">
        <Link className="backlink" href="/work">Work 목록으로</Link>
        <h1>{work.title}</h1>
        <p className="sum">{work.summary}</p>
        <div className="tags">
          {work.tagLabel && <span className="tag">{work.tagLabel}</span>}
          {work.techTags.map(t => <span className="tag" key={t}>{t}</span>)}
          {work.year && <span className="tag num">{work.year}</span>}
        </div>
      </div>

      {work.heroUrl && (
        <div className="wrap wd-cover">
          <div className="slot mask">
            <img src={work.heroUrl} alt={`${work.title} 화면`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      )}

      <div className="wrap wd-body">
        <article className="wd-art">
          {acts.length > 0 ? (
            acts.map(a => (
              <div key={a.no}>
                <h2><span className="no">{a.no}</span>{a.label}</h2>
                <p>{a.body}</p>
              </div>
            ))
          ) : (
            <p>{work.summary}</p>
          )}
        </article>

        <aside className="aside">
          <div className="aside__head"><span>Project Sheet</span><span>{work.slug}</span></div>
          <dl>
            {work.periodLabel && <div className="row"><dt>기간</dt><dd className="num">{work.periodLabel}</dd></div>}
            {work.year && <div className="row"><dt>연도</dt><dd className="num">{work.year}</dd></div>}
            {work.scopeLabel && <div className="row"><dt>범위</dt><dd>{work.scopeLabel}</dd></div>}
            {work.techTags.length > 0 && <div className="row"><dt>기술</dt><dd>{work.techTags.join(' · ')}</dd></div>}
            {work.builders.length > 0 && (
              <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <dt>참여 빌더</dt>
                <dd style={{ textAlign: 'left' }}>
                  {work.builders.map(b => (
                    <Link className="b-chip" href={`/builder?b=${b.slug}`} style={{ textDecoration: 'none' }} key={b.slug}>
                      <i style={{ backgroundImage: `url(/assets/img/av-${b.slug}.jpg)`, backgroundSize: 'cover' }}></i>
                      {b.name}{b.roleLabel ? ` · ${b.roleLabel}` : ''}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          {work.builders.length > 0 && <p className="note">빌더 칩을 누르면 프로필과 작업물로 이동합니다.</p>}
        </aside>
      </div>

      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="wrap">
          <div className="cta-banner">
            <div>
              <h3>비슷한 프로젝트를 계획 중이신가요?</h3>
              <p>지금 상황을 알려주시면, 맞는 빌더와 진행 방식을 제안드립니다.</p>
            </div>
            <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="work_detail">프로젝트 문의 <span className="arr">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
