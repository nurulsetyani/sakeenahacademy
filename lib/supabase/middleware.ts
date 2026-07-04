import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

const PUBLIC_PREFIXES = [
  "/",
  "/kelas",
  "/tentang",
  "/verifikasi-sertifikat",
  "/login",
  "/register",
  "/lupa-password",
  "/reset-password",
];

const ROLE_PREFIXES: Record<string, "murid" | "guru" | "admin"> = {
  "/murid": "murid",
  "/guru": "guru",
  "/admin": "admin",
};

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => prefix !== "/" && (pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (!isPublicPath(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Kelas gratis tetap wajib login+enroll (PRD §11.1) — pengguna sudah login sampai sini,
  // pengecekan role/dashboard hanya berlaku untuk area /murid, /guru, /admin di bawah ini.
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (matchedPrefix) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .single();

    const requiredRole = ROLE_PREFIXES[matchedPrefix];

    if (!profile || profile.role !== requiredRole || profile.account_status !== "active") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
