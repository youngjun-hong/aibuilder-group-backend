import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service'

/* FR-A00-01: /admin/* 는 서버(미들웨어) 단에서 막는다 — 클라이언트 판정 금지.
   FR-A07-05/G7: /admin/approvals 는 admin 역할이 아니면 여기서 바로 403.
   DR-08: 슬러그 변경·archive 로 죽은 /work·/insight 상세 URL은 301 로 새 위치로 보낸다
   (redirects 테이블 — Server Component 의 redirect()/permanentRedirect() 는 307/308 만
   가능해서 여기서 처리한다). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    return handleAdminGate(request)
  }
  if (/^\/work\/[^/]+$/.test(pathname) || /^\/insight\/[^/]+$/.test(pathname)) {
    return handleContentRedirect(request, pathname)
  }
  return NextResponse.next()
}

async function handleAdminGate(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { pathname } = request.nextUrl
  if (pathname === '/admin/login') return response

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/admin/login', request.url))

  const { data: builder } = await supabase
    .from('builders')
    .select('role, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!builder || !builder.is_active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (pathname.startsWith('/admin/approvals') && builder.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return response
}

async function handleContentRedirect(request: NextRequest, pathname: string) {
  const service = createServiceClient()
  const { data } = await service.from('redirects').select('to_path').eq('from_path', pathname).maybeSingle()
  if (data) return NextResponse.redirect(new URL(data.to_path, request.url), 301)
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/work/:slug', '/insight/:slug'],
}
