import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { signDevAccessToken } from "@/lib/auth/sign-dev";

export async function POST() {
  if ((process.env.AUTH_MODE ?? "dev") === "clerk") {
    return NextResponse.json(
      {
        error:
          "AUTH_MODE=clerk — use o Sign-In do Clerk. Configure CLERK_* e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.",
      },
      { status: 400 },
    );
  }

  const token = await signDevAccessToken();
  const res = NextResponse.json({
    accessToken: token,
    mode: "dev",
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
