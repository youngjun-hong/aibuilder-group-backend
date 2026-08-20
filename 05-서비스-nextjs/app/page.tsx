import './home.css'
import HomeView from './home-view'
import { listFaqHomeTopics } from '@/lib/data/faq'
import { getSiteContentMap } from '@/lib/data/siteContent'
import { listPublishedWorks } from '@/lib/data/works'
import { listPublishedInsights } from '@/lib/data/insights'
import { listActiveVideosWithFeatured } from '@/lib/data/content'

export default async function HomePage() {
  const [faqHome, content, works, insights, videos] = await Promise.all([
    listFaqHomeTopics(),
    getSiteContentMap(),
    listPublishedWorks(),
    listPublishedInsights(),
    listActiveVideosWithFeatured(),
  ])

  return (
    <HomeView
      faqHome={faqHome}
      content={content}
      previewWorks={works.slice(0, 3)}
      previewInsights={insights.slice(0, 3)}
      previewFeatured={videos.featured}
      previewSideVideos={videos.grid.slice(0, 2)}
    />
  )
}
