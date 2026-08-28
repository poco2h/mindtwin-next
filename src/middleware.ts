import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // /profesionales y /app/conversar son públicas para que docentes y alumnos puedan ver la landing y probar la demo
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/profesionales"],
};
