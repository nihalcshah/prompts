import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Email allowlist - only these emails can sign up
const ALLOWED_EMAILS = ["nihalcshah@gmail.com"];

const isEmailAllowed = (email: string): boolean => {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase credentials are not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check for unauthorized OAuth signups
  if (user && user.email && !isEmailAllowed(user.email)) {
    // Sign out unauthorized user
    await supabase.auth.signOut();

    // Redirect to signin with error
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("error", "unauthorized_email");
    return NextResponse.redirect(url);
  }

  // Protect /admin routes - only allow authorized admin user
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user || !user.email || user.email !== "nihalcshah@gmail.com") {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("error", "admin_access_denied");
      return NextResponse.redirect(url);
    }
  }

  // Only protect /dashboard routes - redirect unauthenticated users to /signin
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // For authenticated users accessing protected routes, ensure profile exists
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // If profile doesn't exist (PGRST116 is "not found" error), create it
      if (fetchError && fetchError.code === "PGRST116") {
        const newProfile = {
          user_id: user.id,
          display_name:
            user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from("profiles").upsert(newProfile, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        });
      }
    } catch (error) {
      // Log error but don't block the request
      console.error("Profile upsert error in middleware:", error);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
