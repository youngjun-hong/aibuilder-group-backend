'use client'

import { useEffect } from 'react'

/* FR-A00-07 — 편집 중 이탈 시 저장하지 않은 변경 경고.
 *  탭 닫기·새로고침·브라우저 뒤로가기는 beforeunload 로 막는다. App Router 는 라우트 전환
 *  시작 이벤트가 따로 없어서, 앱 내부 링크 클릭까지 막으려면 각 편집 화면에서 저장 버튼
 *  옆 링크에 confirm() 을 개별로 걸어야 한다 — A-03/A-05 편집기에서 그렇게 처리한다. */
export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
