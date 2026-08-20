import { pageMeta } from '@/app/_meta'
import { listActiveVideosWithFeatured, listChannels } from '@/lib/data/content'
import './content.css'
import ContentView from './view'

export const metadata = pageMeta({
  title: '콘텐츠 — AI 빌더 그룹',
  path: '/content',
})

export default async function ContentPage() {
  const [{ featured, grid }, channels] = await Promise.all([listActiveVideosWithFeatured(), listChannels()])
  return <ContentView featured={featured} grid={grid} channels={channels} />
}
