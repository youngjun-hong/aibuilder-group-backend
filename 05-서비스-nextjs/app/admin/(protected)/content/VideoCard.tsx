'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { toggleVideoActive, setFeaturedVideo, deleteVideo } from './actions'
import type { AdminVideoRow } from '@/lib/data/content'

export default function VideoCard({ video }: { video: AdminVideoRow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className={'admin-vcell' + (video.isActive ? '' : ' admin-vcell--inactive')}>
      <Link href={`/admin/content/${video.id}`} className="admin-vcell__thumb">
        <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
        {video.isFeatured && <span className="admin-vcell__featured">✳ 피처드</span>}
        {video.durationLabel && <span className="admin-vcell__dur">{video.durationLabel}</span>}
        <div className="admin-vcell__cap">
          <b>{video.title}</b>
          <span>{video.channelName ?? '채널 미지정'}</span>
        </div>
      </Link>
      <div className="admin-vcell__row">
        <Link className="admin-btn admin-btn--ghost" href={`/admin/content/${video.id}`}>수정</Link>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={pending || video.isFeatured}
          onClick={() => startTransition(async () => { await setFeaturedVideo(video.id); router.refresh() })}
        >
          {video.isFeatured ? '피처드 지정됨' : '피처드로 지정'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={pending}
          onClick={() => startTransition(async () => { await toggleVideoActive(video.id, !video.isActive); router.refresh() })}
        >
          {video.isActive ? '비활성화' : '활성화'}
        </button>
        <ConfirmButton
          label="삭제"
          title="영상 삭제"
          body={`"${video.title}"을(를) 삭제합니다.`}
          confirmLabel="삭제"
          action={async () => { await deleteVideo(video.id); router.refresh() }}
        />
      </div>
    </div>
  )
}
