import { pageMeta } from '@/app/_meta'
import { isPluugApiConfigured } from '@/lib/pluug'
import './contact.css'
import ContactView from './view'

export const metadata = pageMeta({
  title: '프로젝트 문의 — AI 빌더 그룹',
  path: '/contact',
})

/* 서버에서만 판정 — PLUUG_API_KEY 는 비공개 값이라 클라이언트 번들에 못 들어간다.
   켜져 있는지 여부(boolean)만 내려보낸다. */
export default function ContactPage() {
  return <ContactView pluugApiConfigured={isPluugApiConfigured()} />
}
