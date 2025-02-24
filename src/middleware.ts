import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  // Adjust the matcher to skip public routes like "/" and "/api/webhook"
  matcher: [
    // This pattern will run the middleware for all routes except:
    // - Next.js internal routes (_next)
    // - Static files (files with an extension)
    // - The root path "/" and "/api/webhook"
    "/((?!^/$|^/api/webhook$|_next|.*\\..*).*)",
  ],
};
