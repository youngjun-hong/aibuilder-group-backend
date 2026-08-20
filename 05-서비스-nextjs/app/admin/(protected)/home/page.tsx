import { requireAdmin } from '@/lib/auth/session'
import { listSiteContentForAdmin, sectionLabel } from '@/lib/data/siteContent'
import SectionForm from './SectionForm'

/* 홈 화면 텍스트 카피 관리 — A-01~A-07 표기 밖의 자체 화면. 승인 워크플로 없이 admin 전용.
   Work/Insight/Content 미리보기(S6/S7/S8)는 실제 발행 데이터를 그대로 쓰므로 여기 없다 —
   그 콘텐츠를 바꾸려면 /admin/works·/admin/insights·/admin/content 에서 편집한다. */
export default async function AdminHomePage() {
  await requireAdmin()
  const sections = await listSiteContentForAdmin()

  return (
    <>
      <h1>홈 화면 문구 관리</h1>
      <p className="sub">
        히어로·리본·신뢰 섹션 등 홈 화면 텍스트 카피입니다. 저장하면 홈 화면에 바로 반영됩니다.
        <br />작업물·인사이트·영상 미리보기는 각각 <a href="/admin/works">Work</a>·<a href="/admin/insights">Insight</a>·<a href="/admin/content">Content</a> 관리에서 편집하세요 — 실제 발행 콘텐츠를 그대로 보여줍니다.
      </p>

      {sections.map(s => (
        <SectionForm key={s.section} section={s.section} title={sectionLabel(s.section)} items={s.items} />
      ))}
    </>
  )
}
