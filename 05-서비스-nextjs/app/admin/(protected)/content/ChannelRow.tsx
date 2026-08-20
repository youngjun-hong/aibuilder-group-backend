'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveChannel } from './actions'
import type { Channel } from '@/lib/data/content'

export default function ChannelRow({ channel }: { channel: Channel }) {
  const router = useRouter()
  const [name, setName] = useState(channel.name)
  const [href, setHref] = useState(channel.href)
  const [pending, startTransition] = useTransition()
  const dirty = name !== channel.name || href !== channel.href

  return (
    <tr>
      <td><input type="text" value={name} onChange={e => setName(e.target.value)} /></td>
      <td><input type="text" value={href} onChange={e => setHref(e.target.value)} /></td>
      <td className="actions">
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={!dirty || pending}
          onClick={() => startTransition(async () => { await saveChannel(channel.id, name, href); router.refresh() })}
        >
          {pending ? '저장 중…' : '저장'}
        </button>
      </td>
    </tr>
  )
}
