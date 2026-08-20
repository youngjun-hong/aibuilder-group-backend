'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

/* FR-A03-01/02 — Tiptap 필수 스택, h1 은 스키마 자체에서 제외한다(레벨 목록에 1을 안 준다 —
   툴바에서 숨기는 것보다 강한 방어. 붙여넣기로 들어온 h1 도 여기서부터 만들어질 수 없다).
   서버 저장 시 lib/content/sanitize.ts 가 한 번 더 h1→h2 로 강등해서 이중으로 막는다. */
export default function TiptapEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }), // Tiptap v3 StarterKit는 link 를 기본 포함 — 아래 별도 설정과 중복 등록되지 않게 끈다
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  })

  if (!editor) return null

  const btn = (active: boolean) => 'tiptap-btn' + (active ? ' on' : '')

  return (
    <div className="tiptap-wrap">
      <div className="tiptap-toolbar">
        <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo; &rdquo;</button>
        <button
          type="button"
          className="tiptap-btn"
          onClick={() => {
            const url = window.prompt('링크 URL')
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  )
}
