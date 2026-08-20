# GA4 · SEO(구글/네이버) · 대시보드 연동 가이드

이 문서에 적힌 값은 전부 `.env.local`에 넣습니다(`cp .env.example .env.local`).
비워두면 해당 기능만 꺼지고 사이트·관리자 화면은 그대로 동작합니다.

## 1. GA4 측정 ID — 사이트 전체 이벤트 수집

1. [Google Analytics](https://analytics.google.com) → 관리(좌하단 톱니) → **데이터 스트림** → 웹 스트림 선택
2. 상단의 **측정 ID**(`G-XXXXXXXXXX` 형식)를 복사
3. `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. 값을 넣고 재배포하면 모든 페이지에 gtag.js 가 로드되고, 사이트 전역의 `[data-track]` 클릭
   (CTA 클릭, 작업물 카드 클릭, 유튜브 아웃바운드 등)이 실제 GA4 이벤트로 전송됩니다.
   (지금까지는 `components/SiteFx.tsx`가 콘솔에 로그만 찍는 스텁이었습니다.)

## 2. GA4 속성 ID — 관리자 대시보드 실트래픽용

측정 ID와는 다른 값입니다(측정 ID는 스트림 단위, 속성 ID는 GA4 속성 단위).

1. 같은 관리 화면에서 **속성 설정** → **속성 ID**(숫자만, 예: `123456789`)
2. `.env.local`:
   ```
   GA4_PROPERTY_ID=123456789
   ```
3. 이 값만으로는 부족합니다 — §5의 서비스 계정도 같이 필요합니다.

## 3. 구글 서치콘솔 — 소유 확인 + 사이트맵 제출

1. [Google Search Console](https://search.google.com/search-console) → 속성 추가 → **URL 접두어** 방식 권장(도메인 속성은 DNS 인증이 필요해 더 번거롭습니다)
2. 소유 확인 방법 중 **HTML 태그**를 선택하면 다음과 같은 태그가 나옵니다:
   ```html
   <meta name="google-site-verification" content="여기_긴_문자열" />
   ```
   `content` 값만 복사해 `.env.local`:
   ```
   GOOGLE_SITE_VERIFICATION=여기_긴_문자열
   ```
3. 값을 넣고 배포한 뒤 서치콘솔에서 **확인** 버튼을 누릅니다 — 배포된 사이트에 메타태그가 실제로 나가야 통과합니다.
4. 확인이 끝나면 서치콘솔 좌측 **Sitemaps** 메뉴에 `https://<도메인>/sitemap.xml` 을 제출합니다
   (사이트맵은 이미 `app/sitemap.ts`가 자동 생성 — 발행된 Work/Insight가 자동으로 포함됩니다).

## 4. 네이버 서치어드바이저 — 소유 확인 + 사이트맵 제출

1. [네이버 서치어드바이저](https://searchadvisor.naver.com) → 사이트 등록 → 소유 확인 방법 중 **HTML 태그**
   ```html
   <meta name="naver-site-verification" content="여기_긴_문자열" />
   ```
2. `.env.local`:
   ```
   NAVER_SITE_VERIFICATION=여기_긴_문자열
   ```
3. 배포 후 서치어드바이저에서 **소유 확인** → 좌측 **요청 → 사이트맵 제출**에 `/sitemap.xml` 등록

**⚠ 한계**: 네이버는 구글과 달리 검색 노출·클릭 지표를 가져올 수 있는 공개 리포팅 API가 없습니다.
그래서 이 저장소의 관리자 대시보드(`/admin`)에는 네이버 쪽 실측 그래프가 없습니다 — 소유 확인과
사이트맵 제출까지만 여기서 자동화되고, 이후 노출수·클릭 같은 지표는 네이버 서치어드바이저
웹 콘솔에 직접 로그인해서 확인해야 합니다.

## 5. GCP 서비스 계정 — 대시보드 실트래픽(GA4 · 서치콘솔)용

관리자 대시보드가 GA4·서치콘솔 수치를 그래프로 보여주려면, 두 API를 대신 조회할 서비스 계정이
필요합니다(사람 로그인 없이 서버가 자동으로 호출하기 위함).

1. [Google Cloud Console](https://console.cloud.google.com) 에서 프로젝트 생성(또는 기존 프로젝트 사용)
2. **API 및 서비스 → 라이브러리**에서 아래 두 개를 각각 검색해 **사용 설정**:
   - `Google Analytics Data API`
   - `Google Search Console API`
3. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → 서비스 계정**으로 새 서비스 계정 생성
4. 생성된 서비스 계정 → **키** 탭 → **키 추가 → 새 키 만들기 → JSON** → 다운로드
5. GA4 쪽 권한 부여: GA4 관리 → **속성 액세스 관리** → **+** → 서비스 계정 이메일
   (JSON 안의 `client_email`, `xxx@xxx.iam.gserviceaccount.com` 형식) 을 **뷰어** 권한으로 추가
6. 서치콘솔 쪽 권한 부여: 서치콘솔 → **설정 → 사용자 및 권한 → 사용자 추가** → 같은 서비스 계정
   이메일을 **전체(전체 소유자 아님, 읽기로 충분)** 권한으로 추가
7. 다운로드한 JSON 파일을 열어 **내용 전체를 한 줄로** `.env.local`에 붙여넣기:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com", ...}
   ```
   ⚠ `private_key` 안의 줄바꿈은 JSON 안에서 이미 `\n` 문자열로 이스케이프되어 있으므로
   파일 내용을 그대로 한 줄에 붙여넣으면 됩니다(직접 줄바꿈을 넣지 마세요).
8. 서치콘솔에 등록한 속성 식별자도 그대로 추가(URL 접두어 방식이면 마지막에 `/`까지 포함):
   ```
   GOOGLE_SEARCH_CONSOLE_SITE_URL=https://example.com/
   ```

값을 넣고 재배포하면 `/admin` 대시보드의 "GA4 실트래픽"·"구글 서치콘솔" 섹션에 그래프가 뜹니다.
값이 비어 있거나 권한이 없으면 에러 대신 "연동 필요" 카드만 표시됩니다(대시보드 자체는 죽지 않음).

## env var 요약

| 변수 | 용도 | 없으면 |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 사이트 전역 GA4 이벤트 수집 | gtag.js 자체가 안 실림 |
| `GOOGLE_SITE_VERIFICATION` | 구글 서치콘솔 소유 확인 메타태그 | 메타태그 안 나감(소유 확인 불가) |
| `NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 소유 확인 메타태그 | 메타태그 안 나감(소유 확인 불가) |
| `GA4_PROPERTY_ID` | 대시보드 GA4 실트래픽 그래프 | GA4 섹션이 "연동 필요" 카드로 표시 |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | 대시보드 서치콘솔 실측 그래프 | 서치콘솔 섹션이 "연동 필요" 카드로 표시 |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | GA4·서치콘솔 API 호출 인증(둘 다에 필요) | 두 섹션 모두 "연동 필요" 카드로 표시 |
