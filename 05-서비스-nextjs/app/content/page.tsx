import { pageMeta } from '@/app/_meta'
import { listActiveVideosWithFeatured, listChannels } from '@/lib/data/content'
import './content.css'
import ContentView from './view'

export const metadata = pageMeta({
  title: '콘텐츠 — AI 빌더 그룹',
  path: '/content',
  description: '영상으로 보는 AI 빌더 그룹의 실제 작업 — 유튜브 콘텐츠 모음.',
})

export default async function ContentPage() {
  const [{ featured, grid }, channels] = await Promise.all([listActiveVideosWithFeatured(), listChannels()])
  return <ContentView featured={featured} grid={grid} channels={channels} />
}
