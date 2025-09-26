import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { getToken } from 'next-auth/jwt';

// Define app configurations with container names for Docker networking
const APP_CONFIGS = {
  master: {
    port: 3001,
    path: '/master',
    container: 'inops-master-app'
  },
  dashboard: {
    port: 3004,
    path: '/dashboard',
    container: 'inops-dashboard-app',
    healthCheck: '/dashboard/api/health'  // Add explicit health check path
  },
  workflow: {
    port: 3002,
    path: '/workflow',
    container: 'inops-workflow-app'
  },
  reports: {
    port: 3003,
    path: '/reports',
    container: 'inops-reports-app',
    healthCheck: '/reports/api/health'  
  },
  leave: {
    port: 3005,
    path: '/leave',
    container: 'inops-leave-app'
  },
  muster: {
    port: 3006,
    path: '/muster',
    container: 'inops-muster-app'
  }
} as const;

// Track if master app is ready
let isMasterAppReady = false;

// Function to get the appropriate host for Docker vs local development
function getAppHost(containerName: string, port: number): string {
  // In Docker, use container names for internal communication
  // In local development, use localhost
  const isDocker = process.env.DOCKER_ENV === 'true';
  return isDocker ? `http://${containerName}:${port}` : `https://www.inopsit.com`;
}

// Function to handle app routing
async function handleAppRouting(request: NextRequestWithAuth) {
  // Special handling for master app routes
  if (request.nextUrl.pathname.startsWith('/master')) {
    if (!isMasterAppReady) {
      try {
        const masterConfig = APP_CONFIGS.master;
        const masterHost = getAppHost(masterConfig.container, masterConfig.port);
        
        // Try to connect to master app
        const response = await fetch(`${masterHost}/master`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2000) // Increased timeout for Docker
        });
        
        if (response.ok) {
          isMasterAppReady = true;
        } else {
          // If master app is not ready, return a retry response
          return new NextResponse(
            JSON.stringify({
              status: 'loading',
              message: 'Master application is starting up, please refresh in a few seconds...'
            }),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '5',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
                'Access-Control-Allow-Credentials': 'true'
              }
            }
          );
        }
      } catch (error) {
        console.error('Error connecting to master app:', error);
        // If connection fails, return retry response
        return new NextResponse(
          JSON.stringify({
            status: 'loading',
            message: 'Master application is starting up, please refresh in a few seconds...'
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '5',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
              'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }
    }

    // Create the URL for the master application
    const masterConfig = APP_CONFIGS.master;
    const masterHost = getAppHost(masterConfig.container, masterConfig.port);
    const masterUrl = new URL(request.nextUrl.pathname, masterHost);
    masterUrl.search = request.nextUrl.search;

    // Add necessary headers for the master app
    const response = NextResponse.rewrite(masterUrl);
    
    // Add CORS and other necessary headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('X-Frame-Options', 'ALLOW-FROM https://www.inopsit.com');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://www.inopsit.com");

    return response;
  }

  // Handle dashboard app routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const dashboardConfig = APP_CONFIGS.dashboard;
    const dashboardHost = getAppHost(dashboardConfig.container, dashboardConfig.port);
    const targetUrl = new URL(request.nextUrl.pathname, dashboardHost);
    targetUrl.search = request.nextUrl.search;

    const response = NextResponse.rewrite(targetUrl, {
      headers: {
        'X-Forwarded-Host': request.headers.get('host') || '',
        'X-Forwarded-Proto': 'http',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      }
    });

    // Add CORS and other necessary headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }

  // Handle reports app routes
  if (request.nextUrl.pathname.startsWith('/reports')) {
    const reportsConfig = APP_CONFIGS.reports;
    const reportsHost = getAppHost(reportsConfig.container, reportsConfig.port);
    const targetUrl = new URL(request.nextUrl.pathname, reportsHost);
    targetUrl.search = request.nextUrl.search;

    const response = NextResponse.rewrite(targetUrl, {
      headers: {
        'X-Forwarded-Host': request.headers.get('host') || '',
        'X-Forwarded-Proto': 'http',
        'X-Real-IP': request.headers.get('x-real-ip') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      }
    });

    // Add CORS and other necessary headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }

  // Handle other app routes
  for (const [appName, config] of Object.entries(APP_CONFIGS)) {
    if (appName !== 'master' && request.nextUrl.pathname.startsWith(config.path)) {
      const appHost = getAppHost(config.container, config.port);
      const targetUrl = new URL(request.nextUrl.pathname, appHost);
      targetUrl.search = request.nextUrl.search;

      const response = NextResponse.rewrite(targetUrl);
      
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');

      return response;
    }
  }

  return NextResponse.next();
}

// Export the combined middleware with authentication
export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    // Handle invalid login URLs
    if (request.nextUrl.pathname.startsWith('/login/') || request.nextUrl.pathname === '/login6') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // First check if the request is for auth-related paths
    if (
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname === '/favicon.ico' ||
      request.nextUrl.pathname.startsWith('/public') ||
      request.nextUrl.pathname === '/login' // Allow access to custom login page
    ) {
      return NextResponse.next();
    }

    // Check for token and expiry
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.expires_at) {
      // No token or no expiry info, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (token.expires_at * 1000 < Date.now()) {
      // Token expired, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Then handle app routing
    return handleAppRouting(request);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // Redirect to custom login page instead of directly to Keycloak
    },
  }
);

// Update matcher to catch all routes that need authentication and routing
export const config = {
  matcher: [
    // Auth matcher (protect all routes except auth-related ones and login page)
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
    // App routing matcher
    '/master/:path*',
    '/master',
    '/dashboard/:path*',
    '/dashboard',
    '/workflow/:path*',
    '/workflow',
    '/reports/:path*',
    '/reports',
    '/leave/:path*',
    '/leave'
  ]
}; 