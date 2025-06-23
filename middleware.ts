import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// List of paths that don't require authentication
const publicPaths = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/api/auth',
  '/api/public',
  '/api/socket',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/error',
  '/_error',
  '/_webpack',
  '/_vercel',
  '/__nextjs',
  '/site.webmanifest',
  '/uploads'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Critical - Skip any socket.io or websocket related paths immediately
  if (pathname.includes('/socket') || 
      pathname.includes('/api/socket') || 
      request.headers.get('upgrade') === 'websocket') {
    return NextResponse.next();
  }
  
  // Skip middleware for public paths
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  console.log("Middleware running for path:", pathname);

  // Check if this is an auth page
  const isAuthPage = pathname.startsWith("/login") || 
                   pathname.startsWith("/register") || 
                   pathname.startsWith("/forgot-password") || 
                   pathname.startsWith("/reset-password");
                     
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicApiRoute = pathname.startsWith("/api/public");
  
  // If it's an API auth route or public route, let it pass
  if (isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Get the token and check if it's valid
  const token = await getToken({ req: request });
  console.log("Middleware token:", token?.role || "No role");

  // If not logged in and trying to access protected page
  if (!token && !isAuthPage) {
    console.log("No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and trying to access auth page
  if (token && isAuthPage) {
    // Check role and redirect to appropriate dashboard
    const userRole = token.role as string;
    if (!userRole) {
      console.log("Token exists but no role, letting it pass");
      return NextResponse.next();
    }
    
    console.log("User logged in and trying to access auth page, redirecting based on role:", userRole);
    let redirectPath = "/dashboard";  // Use the central dashboard router as default
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Check permissions based on role
  if (token) {
    const userRole = token.role as string;
    if (!userRole) {
      console.log("Token exists but role is undefined, letting it pass");
      return NextResponse.next();
    }
    
    const userId = token.sub as string;
    console.log(`Checking path permissions for user with role: ${userRole}`);

    // Define access permissions by path
    const adminOnlyPaths = ["/admin"];
    const teacherOnlyPaths = ["/advisor-dashboard", "/manage-theses", "/teacher"];
    const studentOnlyPaths = ["/submit-thesis", "/student"];
    
    // Check admin path access
    if (adminOnlyPaths.some(path => pathname.startsWith(path)) && userRole !== "admin") {
      console.log("Non-admin trying to access admin path");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    
    // Check teacher path access
    if (teacherOnlyPaths.some(path => pathname.startsWith(path)) && userRole !== "teacher" && userRole !== "admin") {
      console.log("Non-teacher trying to access teacher path");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    
    // Check student path access
    if (studentOnlyPaths.some(path => pathname.startsWith(path)) && userRole !== "student" && userRole !== "admin") {
      console.log("Non-student trying to access student path");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Handle root and dashboard path
    if (pathname === "/" || pathname === "/dashboard") {
      console.log("Root or dashboard path, letting the dashboard page handle the redirect");
      return NextResponse.next();
    }
    
    // Block non-student from accessing /no-thesis
    if (pathname.startsWith("/no-thesis") && userRole !== "student") {
      console.log("Non-student trying to access no-thesis page");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    console.log("Permissions check passed, proceeding");
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Define routes to use this middleware - EXCLUDE SOCKET.IO PATHS
export const config = {
  matcher: [
    // Only match these specific routes
    '/admin/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/dashboard',

    '/no-thesis',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    // API routes excluding socket
    '/api/((?!socket).*)' 
  ],
}; 