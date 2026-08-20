import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { listVideosForAdmin, listChannelsForAdmin } from '@/lib/data/content'
import VideoCard from './VideoCard'
import ChannelRow from './ChannelRow'

/* Content(유튜브) 관리 — 02-화면설계/P-06 스펙: 관리자가 URL·제목·썸네일 등록, 피처드 1건 지정.
   자체 개발 화면(A-01~A-07 표기 밖) — 승인 워크플로 없이 admin 전용 CRUD. */
export default async function AdminContentPage() {
  await requireAdmin()
  const [videos, channels] = await Promise.all([listVideosForAdmin(), listChannelsForAdmin()])

  return (
    <>
      <h1>Content 관리</h1>
      <p className="sub">유튜브 영상·채널 — 공개 /content 페이지에 그대로 반영됩니다</p>

      <div className="admin-toolbar">
        <span className="spacer" />
        <Link className="admin-btn admin-btn--lime" href="/admin/content/new">+ 새 영상</Link>
      </div>

      <div className="admin-vgrid">
        {videos.map(v => <VideoCard video={v} key={v.id} />)}
        {videos.length === 0 && <p className="hint">등록된 영상이 없습니다.</p>}
      </div>

      <h2 className="admin-section-h">채널</h2>
      <table className="admin-table">
        <thead><tr><th>이름</th><th>링크</th><th></th></tr></thead>
        <tbody>
          {channels.map(c => <ChannelRow channel={c} key={c.id} />)}
        </tbody>
      </table>
    </>
  )
}
