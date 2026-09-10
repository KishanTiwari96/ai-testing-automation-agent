import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("gh_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Github token not found" }, { status: 401 });
    }

    const allRepos: any[] = [];
    let page = 1;

    // Fetch user repos (up to 500)
    while (page <= 5) {
      const res = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "AI-Testing-Automation-Agent",
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`GitHub Repos API error (status ${res.status}):`, errorText);
        break;
      }

      const repos = await res.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        break;
      }

      allRepos.push(...repos);
      if (repos.length < 100) break;
      page++;
    }

    return NextResponse.json(
      allRepos.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private_: Boolean(r.private),
        html_url: r.html_url,
        description: r.description,
        updated_at: r.updated_at,
        language: r.language || "TypeScript",
        default_branch: r.default_branch || "main",
        owner: typeof r.owner === "string" ? r.owner : (r.owner?.login || ""),
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
      }))
    );
  } catch (error: any) {
    console.error("Error in github repos API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}