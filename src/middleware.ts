import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rota /admin
  if (pathname.startsWith('/admin')) {
    // Verificar se há token de autenticação no localStorage seria feito no cliente
    // Aqui apenas redirecionamos para login se não estiver autenticado
    const authCookie = request.cookies.get('sorrisinho_admin_auth');
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};