import { pageMeta } from '@/app/_meta'
import { listPublishedInsights } from '@/lib/data/insights'
import { listCategories } from '@/lib/data/categories'
import './insight.css'
import InsightView from './view'

export const metadata = pageMeta({
  title: 'Insight — AI 빌더 그룹',
  path: '/insight',
})

export default async function InsightPage() {
  const [articles, categories] = await Promise.all([listPublishedInsights(), listCategories('insight')])
  return <InsightView articles={articles} categories={categories} />
}
