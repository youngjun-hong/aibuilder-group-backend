import { pageMeta } from '@/app/_meta'
import { listPublishedInsights } from '@/lib/data/insights'
import { listCategories } from '@/lib/data/categories'
import './insight.css'
import InsightView from './view'

export const metadata = pageMeta({
  title: 'Insight — AI 빌더 그룹',
  path: '/insight',
  description: 'AI 도입·바이브 코딩 외주에 대한 실전 가이드와 인사이트를 확인하세요.',
})

export default async function InsightPage() {
  const [articles, categories] = await Promise.all([listPublishedInsights(), listCategories('insight')])
  return <InsightView articles={articles} categories={categories} />
}
