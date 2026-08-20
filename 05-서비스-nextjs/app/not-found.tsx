import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main">
      <div className="wrap" style={{ padding: '120px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.05em', margin: '0 0 14px' }}>
          페이지를 찾을 수 없습니다
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, margin: '0 0 28px' }}>
          주소가 바뀌었거나 삭제된 페이지일 수 있습니다.
        </p>
        <Link className="btn btn--lime" href="/">홈으로 돌아가기 <span className="arr">→</span></Link>
      </div>
    </main>
  )
}
