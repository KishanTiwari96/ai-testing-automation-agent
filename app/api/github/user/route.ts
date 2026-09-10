import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("gh_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "AI-Testing-Agent",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const userData = await res.json();

    return NextResponse.json({
      authenticated: true,
      token,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        totalPrivateRepos: userData.total_private_repos,
      },
    });
  } catch (error: any) {
    console.error("Error fetching GitHub user:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("gh_token");
    return NextResponse.json({ success: true, message: "Disconnected GitHub account" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
