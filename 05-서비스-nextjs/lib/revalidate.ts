import { revalidatePath } from 'next/cache'

/** 발행·수정·승인 시 공개 페이지를 온디맨드 재검증한다 (FR-A03-08/FR-A07-03 — 60초 이내 반영). */
export function revalidateWork(slug: string) {
  revalidatePath(`/work/${slug}`)
  revalidatePath('/work')
  revalidatePath('/sitemap.xml')
}

export function revalidateInsight(slug: string) {
  revalidatePath(`/insight/${slug}`)
  revalidatePath('/insight')
  revalidatePath('/sitemap.xml')
}
