import { signOutAction } from '@/app/admin/logout-action'

/* FR-A00-04 — 헤더 메뉴의 로그아웃. */
export default function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button className="admin-btn admin-btn--ghost" type="submit">로그아웃</button>
    </form>
  )
}
