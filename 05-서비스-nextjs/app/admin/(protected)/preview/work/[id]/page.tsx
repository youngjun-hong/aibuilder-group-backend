import { notFound } from 'next/navigation'
import { requireActiveBuilder } from '@/lib/auth/session'
import { getWorkByIdForPreview } from '@/lib/data/works'
import '@/app/work/[slug]/work-detail.css'
import WorkDetailView from '@/app/work/[slug]/view'

/* FR-A07-02 — 공개 화면과 동일한 렌더, 단 이 URL 자체가 /admin/* 안에 있어 미들웨어 인증
   게이트를 거친 사람만 도달한다(별도 토큰 URL 없음). RLS 는 admin 전체 / 작성자 본인만
   pending 행을 볼 수 있게 하므로 이중으로 막힌다. */
export default async function WorkPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireActiveBuilder()
  const { id } = await params
  const work = await getWorkByIdForPreview(id)
  if (!work) notFound()
  return <WorkDetailView work={work} />
}
