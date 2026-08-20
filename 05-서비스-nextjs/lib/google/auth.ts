import { JWT } from 'google-auth-library'

type ServiceAccountKey = { client_email: string; private_key: string }

function parseKey(): ServiceAccountKey | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed.client_email || !parsed.private_key) return null
    return parsed
  } catch {
    return null // 값이 있어도 형식이 깨졌으면 조용히 미설정으로 취급 — 대시보드가 죽으면 안 된다
  }
}

/** GA4 Data API · Search Console API 호출용 액세스 토큰.
 *  서비스 계정 키가 없거나 형식이 잘못됐거나 발급에 실패하면 null — 호출부는 이걸 "연동 필요"
 *  상태로 다뤄야 하고 절대 throw 해서 대시보드 전체를 죽이면 안 된다. */
export async function getGoogleAccessToken(scopes: string[]): Promise<string | null> {
  const key = parseKey()
  if (!key) return null
  try {
    const client = new JWT({ email: key.client_email, key: key.private_key, scopes })
    const token = await client.authorize()
    return token.access_token ?? null
  } catch (e) {
    console.error('[google-auth] 액세스 토큰 발급 실패', e)
    return null
  }
}
