import './home.css'
import HomeView from './home-view'
import { listFaqHomeTopics } from '@/lib/data/faq'

export default async function HomePage() {
  const faqHome = await listFaqHomeTopics()
  return <HomeView faqHome={faqHome} />
}
