'use server'

import { redirect } from 'next/navigation'
import { createPluugInquiry } from '@/lib/pluug'

export type ContactFormState = { error: string | null }

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

/** 문의하기 폼 제출 — pluug Open API 로 의뢰를 생성한다.
 *  README §절대 규칙(리드는 우리 DB에 저장 안 함)은 그대로 유지 — 여기서도 Supabase 에는
 *  아무것도 안 쓰고 pluug 로만 보낸다. */
export async function submitContactInquiry(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const nameField = String(formData.get('name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const projectType = String(formData.get('project_type') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const utmSource = String(formData.get('utm_source') ?? '').trim()

  if (!nameField) return { error: '회사 / 담당자명을 입력하세요' }
  if (!phone) return { error: '연락처를 입력하세요' }
  if (!email || !email.includes('@')) return { error: '올바른 이메일을 입력하세요' }
  if (!content) return { error: '프로젝트 내용을 입력하세요' }

  /* pluug 의뢰 객체엔 이메일·연락처 같은 필드가 따로 없다(계약 대상마다 이름·형태가
     다른 워크스페이스별 커스텀 필드로 관리됨 — API 로 실제 확인함). 값을 잃지 않는 가장
     안전한 방법은 content 본문에 라벨을 붙여 전부 넣는 것. */
  const body = [
    `회사/담당자: ${nameField}`,
    `연락처: ${phone}`,
    `이메일: ${email}`,
    projectType && `프로젝트 유형: ${projectType}`,
    budget && `예산 규모: ${budget}`,
    '',
    '문의 내용:',
    content,
  ].filter((line): line is string => Boolean(line)).join('\n')

  const result = await createPluugInquiry({
    name: truncate(`${nameField} 문의`, 64),
    content: body,
    funnel: {
      utmMedium: 'website',
      utmCampaign: 'contact_form',
      ...(utmSource ? { utmSource } : {}),
    },
  })

  if (!result.ok) {
    return {
      error: result.reason === 'not_configured'
        ? '문의 접수 기능이 아직 연결되지 않았습니다. 잠시 후 다시 시도하거나 다른 채널로 연락해 주세요.'
        : '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    }
  }

  redirect('/submit?src=pluug')
}
