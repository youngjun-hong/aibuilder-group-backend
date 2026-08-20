import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { getVideoByIdForAdmin, listChannelsForAdmin } from '@/lib/data/content'
import ContentEditor from '../ContentEditor'

export default async function VideoEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const channels = await listChannelsForAdmin()

  if (id === 'new') {
    return <ContentEditor video={null} channels={channels} />
  }

  const row = await getVideoByIdForAdmin(id)
  if (!row) notFound()

  return (
    <ContentEditor
      video={{
        id: row.id,
        youtubeId: row.youtube_id,
        title: row.title,
        subtitle: row.subtitle,
        durationLabel: row.duration_label,
        isFeatured: row.is_featured,
        isActive: row.is_active,
        channelId: row.channel_id,
        sort: row.sort,
        channelName: null,
      }}
      channels={channels}
    />
  )
}
