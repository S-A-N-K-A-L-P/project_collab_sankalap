/* eslint-disable @typescript-eslint/no-explicit-any -- GitHub OAuth device flow responses are runtime JSON payloads. */
import { NextResponse } from "next/server";

/**
 * GitHub OAuth Device Flow proxy (RFC 8628).
 * Requires ZERO client_secret and ZERO callback URL on the website.
 * Uses NEXT_PUBLIC_GITHUB_CLIENT_ID / GITHUB_CLIENT_ID if set, or falls back to
 * the standard public GitHub CLI OAuth Client ID for open-source developer tools.
 */
const DEFAULT_PUBLIC_CLIENT_ID = "178c6fc778ccc68e1d6a";

function getClientId(override?: string) {
  return (
    override?.trim() ||
    process.env.GITHUB_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID?.trim() ||
    DEFAULT_PUBLIC_CLIENT_ID
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "start");
    const clientId = getClientId(body.clientId);

    if (action === "start") {
      const res = await fetch("https://github.com/login/device/code", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Syncro-Platform",
        },
        body: JSON.stringify({
          client_id: clientId,
          scope: body.scope || "repo read:user",
        }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.device_code) {
        return NextResponse.json(
          { error: data.error_description || data.error || "Could not start GitHub Device Flow." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri || "https://github.com/login/device",
        expiresIn: data.expires_in || 900,
        interval: data.interval || 5,
      });
    }

    if (action === "poll") {
      const deviceCode = String(body.deviceCode || "").trim();
      if (!deviceCode) {
        return NextResponse.json({ error: "Missing deviceCode" }, { status: 400 });
      }
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Syncro-Platform",
        },
        body: JSON.stringify({
          client_id: clientId,
          device_code: deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        // authorization_pending / slow_down are normal polling states
        return NextResponse.json({
          status: data.error,
          errorDescription: data.error_description || "",
          interval: data.interval,
        });
      }
      if (!data.access_token) {
        return NextResponse.json({ error: "No access_token returned from GitHub." }, { status: 400 });
      }

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${data.access_token}`,
          "User-Agent": "Syncro-Platform",
        },
        cache: "no-store",
      });
      const user = userRes.ok ? await userRes.json().catch(() => null) : null;

      return NextResponse.json({
        status: "authorized",
        accessToken: data.access_token,
        user: user
          ? {
              login: user.login,
              name: user.name || user.login,
              avatarUrl: user.avatar_url || "",
            }
          : null,
      });
    }

    if (action === "verify-token") {
      const token = String(body.token || "").trim();
      if (!token) return NextResponse.json({ error: "Token is empty" }, { status: 400 });
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "Syncro-Platform",
        },
        cache: "no-store",
      });
      if (!userRes.ok) {
        return NextResponse.json({ error: "GitHub rejected this token." }, { status: 401 });
      }
      const user = await userRes.json();
      return NextResponse.json({
        status: "authorized",
        user: {
          login: user.login,
          name: user.name || user.login,
          avatarUrl: user.avatar_url || "",
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "GitHub auth failed" }, { status: 500 });
  }
}
