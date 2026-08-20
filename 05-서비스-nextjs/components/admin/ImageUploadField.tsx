'use client'

import { useState, useTransition } from 'react'
import { uploadContentImage } from '@/app/admin/upload-action'

export default function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue?: string | null
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="admin-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} />
      {url && <img src={url} alt="" style={{ maxWidth: 240, borderRadius: 8, marginBottom: 8, display: 'block' }} />}
      <input
        type="file"
        accept="image/*"
        disabled={pending}
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          const fd = new FormData()
          fd.set('file', file)
          startTransition(async () => {
            const res = await uploadContentImage(fd)
            if ('error' in res) setError(res.error)
            else {
              setUrl(res.url)
              setError(null)
            }
          })
        }}
      />
      {pending && <span className="hint">업로드 중…</span>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
