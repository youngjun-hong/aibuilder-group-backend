import Link from 'next/link'
import './not-found.css'

export default function NotFound() {
  return (
    <main id="main">
      <div className="wrap nf">
        <span className="eyebrow"><i></i>Error</span>

        <div className="nf__num rv">
          <span>404</span>
        </div>

        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="t-lead">주소가 바뀌었거나 삭제된 페이지일 수 있어요. 아래에서 원하는 곳으로 다시 가보세요.</p>

        <div className="nf__actions">
          <Link className="btn btn--lime" href="/">홈으로 돌아가기 <span className="arr">→</span></Link>
          <Link className="btn btn--ghost" href="/contact">문의하기</Link>
        </div>

        <nav className="nf__links" aria-label="바로가기">
          <Link href="/work">Work</Link>
          <Link href="/insight">Insight</Link>
          <Link href="/content">Content</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </div>
    </main>
  )
}
