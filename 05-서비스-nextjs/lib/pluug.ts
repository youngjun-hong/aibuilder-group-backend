import { createHmac } from 'node:crypto'

/* pluug Open API — 문의(의뢰) 생성. docs.openapi.pluuug.com 기준(2026-08 확인).
   인증은 매 요청마다 X-API-KEY + X-Signature(요청 본문 HMAC-SHA256, 시크릿 키) 두 헤더가
   필요하다 — 서명이 없으면 서버가 거부한다. 이 모듈은 서버에서만 import 할 것
   (PLUUG_API_SECRET 은 절대 클라이언트 번들에 들어가면 안 됨 — NEXT_PUBLIC_ 접두사 없음). */

const BASE_URL = 'https://openapi.pluuug.com'
const API_KEY = process.env.PLUUG_API_KEY ?? ''
const API_SECRET = process.env.PLUUG_API_SECRET ?? ''

export type PluugInquiryPayload = {
  name: string
  content: string
  funnel?: { utmSource?: string; utmMedium?: string; utmCampaign?: string }
}

export type PluugResult = { ok: true } | { ok: false; reason: 'not_configured' | 'request_failed' }

/** 문의 접수 API가 켜져 있는지 — 서버 컴포넌트에서 UI 분기용으로 쓴다. */
export function isPluugApiConfigured(): boolean {
  return !!API_KEY && !!API_SECRET
}

/** POST /v1/inquiry — 성공(201) 이외엔 전부 실패로 취급하고 이유만 구분해 반환한다.
 *  throw 하지 않는다 — 호출부(서버 액션)가 사용자에게 보여줄 메시지를 스스로 고르게 한다. */
export async function createPluugInquiry(payload: PluugInquiryPayload): Promise<PluugResult> {
  if (!isPluugApiConfigured()) return { ok: false, reason: 'not_configured' }

  const body = JSON.stringify(payload)
  const signature = createHmac('sha256', API_SECRET).update(body).digest('hex')

  try {
    const res = await fetch(`${BASE_URL}/v1/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
        'X-Signature': signature,
      },
      body,
    })
    if (res.status === 201) return { ok: true }
    console.error('[pluug] 문의 생성 실패', res.status, await res.text().catch(() => ''))
    return { ok: false, reason: 'request_failed' }
  } catch (e) {
    console.error('[pluug] 문의 생성 요청 자체가 실패', e)
    return { ok: false, reason: 'request_failed' }
  }
}
