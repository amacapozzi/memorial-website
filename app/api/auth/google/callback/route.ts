import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  let stateData: { userId: string; locale: string } = {
    userId: "",
    locale: "en",
  };
  if (state) {
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      // keep defaults
    }
  }

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(`/${stateData.locale}${path}`, request.url));

  if (error) {
    return redirectTo(`/integrations?error=${error}`);
  }

  if (!code || !state || !stateData.userId) {
    return redirectTo("/integrations?error=missing_params");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return redirectTo("/integrations?error=token_exchange_failed");
    }

    const tokens = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.googleAuthToken.upsert({
      where: { id: stateData.userId },
      create: {
        id: stateData.userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope,
        tokenType: tokens.token_type || "Bearer",
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        scope: tokens.scope,
        tokenType: tokens.token_type || "Bearer",
      },
    });

    await prisma.user.update({
      where: { id: stateData.userId },
      data: { hasCalendarSync: true },
    });

    return redirectTo("/integrations?connected=google-calendar");
  } catch (error) {
    console.error("Google Calendar OAuth error:", error);
    return redirectTo("/integrations?error=server_error");
  }
}
