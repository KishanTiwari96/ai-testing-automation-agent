import { redirect } from "next/navigation"

export async function GET() {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    let redirectUri = (process.env.GITHUB_REDIRECT_URL || (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback` : undefined))?.trim();

    if (!clientId) {
        console.error("Missing GITHUB_CLIENT_ID environment variable");
        return redirect('/workspace?error=missing_github_client_id');
    }

    const params = new URLSearchParams({
        client_id: clientId,
        scope: 'repo read:user'
    })

    if (redirectUri) {
        params.set('redirect_uri', redirectUri)
    }

    redirect(`https://github.com/login/oauth/authorize?${params.toString()}`)
}
