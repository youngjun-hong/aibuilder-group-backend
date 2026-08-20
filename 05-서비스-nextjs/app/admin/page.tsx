import { redirect } from 'next/navigation'

/* 대시보드가 없다(FR-A00-03) — 로그인 여부는 (protected) 레이아웃/미들웨어가 판정하므로
   여기선 그냥 A-02 로 보낸다. */
export default function AdminIndexPage() {
  redirect('/admin/insights')
}
