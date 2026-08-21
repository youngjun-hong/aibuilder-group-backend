import { pageMeta } from '@/app/_meta'
import { listPublishedWorks } from '@/lib/data/works'
import { listBuildersForWorkPage } from '@/lib/data/builders'
import './work.css'
import WorkView from './view'

export const metadata = pageMeta({
  title: 'Work — AI 빌더 그룹',
  path: '/work',
  description: 'AI 빌더 그룹이 실제로 만든 프로젝트 사례 — 업종·기술별로 둘러보고 담당 빌더까지 확인하세요.',
})

export default async function WorkPage() {
  const [projects, builders] = await Promise.all([listPublishedWorks(), listBuildersForWorkPage()])
  return <WorkView projects={projects} builders={builders} />
}
