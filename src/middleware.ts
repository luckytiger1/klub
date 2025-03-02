import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // Create a Supabase client using the new package
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set({ name, value, ...options });
          },
          remove: (name, options) => {
            res.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get the session and authenticated user data with error handling
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Middleware session error:', sessionError);
      return res;
    }
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    // Check if the user is authenticated using the verified user data
    const isAuthenticated = userData?.user && !userError;

    // Define routes that require restaurant owner authentication
    const isRestaurantOwnerRoute = 
      req.nextUrl.pathname.startsWith('/restaurant/dashboard') || 
      req.nextUrl.pathname.startsWith('/restaurant/admin') ||
      req.nextUrl.pathname.startsWith('/restaurant/settings');

    // Define auth routes
    const isAuthRoute = 
      req.nextUrl.pathname.startsWith('/auth/login') || 
      req.nextUrl.pathname.startsWith('/auth/register');

    // Define customer-facing routes that don't require authentication
    const isCustomerRoute =
      req.nextUrl.pathname.startsWith('/scan') ||
      req.nextUrl.pathname.startsWith('/bill') ||
      req.nextUrl.pathname.startsWith('/restaurant') && !isRestaurantOwnerRoute;

    // Check if user is a restaurant owner (if authenticated)
    let isRestaurantOwner = false;
    if (isAuthenticated && userData?.user?.user_metadata?.role === 'restaurant_owner') {
      isRestaurantOwner = true;
    }

    // Redirect non-restaurant owners to home page if they try to access restaurant owner routes
    if (isRestaurantOwnerRoute && (!isAuthenticated || !isRestaurantOwner)) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      redirectUrl.searchParams.set('message', 'You need to be logged in as a restaurant owner to access this page');
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated restaurant owners to dashboard if they try to access auth routes
    if (isAuthRoute && isAuthenticated && isRestaurantOwner) {
      return NextResponse.redirect(new URL('/restaurant/dashboard', req.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue with the request even if there's an error in the middleware
  }

  return res;
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)',
  ],
}; 