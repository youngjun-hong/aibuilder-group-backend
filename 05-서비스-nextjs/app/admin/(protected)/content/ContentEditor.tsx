'use client'

import { useActionState } from 'react'
import { saveVideo } from './actions'
import type { AdminVideoRow, Channel } from '@/lib/data/content'

export default function ContentEditor({ video, channels }: { video: AdminVideoRow | null; channels: Channel[] }) {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(saveVideo, { error: null })

  return (
    <>
      <h1>{video ? '영상 편집' : '새 영상'}</h1>

      <form action={formAction} className="admin-form">
        <input type="hidden" name="id" value={video?.id ?? 'new'} />

        <div className="admin-field">
          <label htmlFor="youtube_id">유튜브 영상 ID</label>
          <input id="youtube_id" name="youtube_id" type="text" defaultValue={video?.youtubeId} required placeholder="예: kkbtjKvnS-Q" />
          <span className="hint">youtube.com/watch?v=<b>이 부분</b></span>
        </div>

        <div className="admin-field">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" type="text" defaultValue={video?.title} required />
        </div>

        <div className="admin-field">
          <label htmlFor="subtitle">부제 / 설명</label>
          <input id="subtitle" name="subtitle" type="text" defaultValue={video?.subtitle ?? ''} placeholder="조회 44만 · NEW 등" />
        </div>

        <div className="admin-field">
          <label htmlFor="duration_label">재생 시간</label>
          <input id="duration_label" name="duration_label" type="text" defaultValue={video?.durationLabel ?? ''} placeholder="11:11" />
        </div>

        <div className="admin-field">
          <label htmlFor="channel_id">채널</label>
          <select id="channel_id" name="channel_id" defaultValue={video?.channelId ?? ''}>
            <option value="">선택 안 함</option>
            {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="admin-field">
          <label>
            <input type="checkbox" name="is_featured" defaultChecked={video?.isFeatured} style={{ width: 'auto', marginRight: 8 }} />
            피처드로 지정 (기존 피처드는 자동 해제됩니다)
          </label>
        </div>

        {state.error && <p className="admin-field error">{state.error}</p>}

        <div className="admin-actions">
          <button className="admin-btn admin-btn--lime" type="submit" disabled={pending}>
            {pending ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </>
  )
}
