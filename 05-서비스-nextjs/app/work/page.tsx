import { pageMeta } from '@/app/_meta'
import { listPublishedWorks } from '@/lib/data/works'
import { listBuildersForWorkPage } from '@/lib/data/builders'
import './work.css'
import WorkView from './view'

export const metadata = pageMeta({
  title: 'Work — AI 빌더 그룹',
  path: '/work',
})

export default async function WorkPage() {
  const [projects, builders] = await Promise.all([listPublishedWorks(), listBuildersForWorkPage()])
  return <WorkView projects={projects} builders={builders} />
}
