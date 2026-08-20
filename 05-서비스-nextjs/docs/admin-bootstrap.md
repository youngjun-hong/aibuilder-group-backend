# 관리자 계정 부트스트랩

A-06(빌더 관리) 화면이 이번 범위에 없어서 계정 발급 UI가 없다. 최초 관리자 계정은
아래 절차로 수동 생성한다.

## 방법 1 — Supabase 대시보드

1. Supabase 대시보드 → 프로젝트 → **Authentication → Users → Add user**
   이메일·비밀번호 입력, **Auto Confirm User** 체크(이메일 인증 절차 생략)
2. 생성된 유저의 UUID를 복사한 뒤, **SQL Editor**에서:
   ```sql
   insert into public.builders (auth_user_id, slug, name, email, role, is_active)
   values ('<위에서 복사한 UUID>', 'admin', '관리자', '<이메일>', 'admin', true);
   ```
3. `/admin/login` 에서 로그인.

## 방법 2 — GoTrue Admin API (service role key 필요)

```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"...","email_confirm":true}'
```

응답의 `id` 를 위 SQL의 `auth_user_id` 로 사용한다.

## 추가 계정 (팀원용)

같은 절차를 반복하되 `role: 'builder'` 로 넣는다. A-06 이 나오기 전까지는 계정 발급·회수·
비활성화 모두 이 방식(대시보드 또는 SQL)으로 처리한다.
