import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { listBuildersForAdmin } from '@/lib/data/builders'
import BuilderStatusButton from './BuilderStatusButton'

const ROLE_LABEL = { admin: '관리자', builder: '빌더' } as const

/* A-06 빌더 관리(03-백로그/추후작업.md) — 원 P0 범위에서 제외됐다가 사용자 요청으로 신설.
   계정 발급·회수만 다룬다(삭제 없음) — 회수해도 발행된 콘텐츠는 유지된다(PRD D4). */
export default async function AdminBuildersPage() {
  const me = await requireAdmin()
  const builders = await listBuildersForAdmin()

  return (
    <>
      <h1>Builders</h1>
      <p className="sub">가입한 빌더 계정 — 발급·권한·활성 상태를 관리합니다.</p>

      <div className="admin-toolbar">
        <span className="spacer" />
        <Link className="admin-btn admin-btn--lime" href="/admin/builders/new">+ 계정 발급</Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>이름</th><th>이메일</th><th>슬러그</th><th>권한</th><th>상태</th><th>발행 건수</th><th></th>
          </tr>
        </thead>
        <tbody>
          {builders.map(b => (
            <tr key={b.id}>
              <td><Link href={`/admin/builders/${b.id}`}>{b.name}</Link></td>
              <td>{b.email}</td>
              <td>{b.slug}</td>
              <td><span className="admin-type-badge">{ROLE_LABEL[b.role]}</span></td>
              <td>
                <span className={`admin-badge admin-badge--${b.isActive ? 'published' : 'archived'}`}>
                  {b.isActive ? '활성' : '회수됨'}
                </span>
              </td>
              <td>{b.doneCount}</td>
              <td className="actions">
                <Link className="admin-btn admin-btn--ghost" href={`/admin/builders/${b.id}`}>수정</Link>
                <BuilderStatusButton id={b.id} isActive={b.isActive} isSelf={b.id === me.id} />
              </td>
            </tr>
          ))}
          {builders.length === 0 && (
            <tr><td colSpan={7} className="empty">등록된 빌더가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  )
}
