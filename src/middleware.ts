import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const user = process.env.OS_USER || "derek";
  const pass = process.env.OS_PASSWORD || "caffeine45";
  const auth = request.headers.get("authorization");

  if (auth) {
    try {
      const encoded = auth.split(" ")[1] || "";
      const decoded = atob(encoded);
      const colonIndex = decoded.indexOf(":");
      if (colonIndex > -1) {
        const u = decoded.slice(0, colonIndex);
        const p = decoded.slice(colonIndex + 1);
        if (u === user && p === pass) {
          return NextResponse.next();
        }
      }
    } catch {
      // bad header
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="DB Tech OS"',
    },
  });
}

export const config = {
  matcher: ["/os", "/os/:path*"],
};
