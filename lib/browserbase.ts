import Browserbase from "@browserbasehq/sdk";

const apiKey = process.env.BROWSERBASE_API_KEY;
const projectId = process.env.BROWSERBASE_PROJECT_ID;

export const isBrowserbaseConfigured = Boolean(apiKey && projectId);

export function getBrowserbaseClient(): Browserbase | null {
  if (!apiKey) return null;
  return new Browserbase({ apiKey });
}

export async function createBrowserbaseSession() {
  if (!apiKey || !projectId) {
    return null;
  }

  try {
    const bb = new Browserbase({ apiKey });
    const session = await bb.sessions.create({
      projectId,
      keepAlive: false,
    });
    return session;
  } catch (error) {
    console.error("Failed to create Browserbase session:", error);
    return null;
  }
}

export async function getBrowserbaseLiveUrls(sessionId: string) {
  if (!apiKey) return { liveUrl: null, replayUrl: null };
  try {
    const bb = new Browserbase({ apiKey });
    const session = await bb.sessions.retrieve(sessionId);
    return {
      liveUrl: `https://www.browserbase.com/sessions/${sessionId}`,
      replayUrl: `https://www.browserbase.com/sessions/${sessionId}`,
      status: session.status,
    };
  } catch (err) {
    console.warn("Could not retrieve session replay URL:", err);
    return { liveUrl: `https://www.browserbase.com/sessions/${sessionId}`, replayUrl: null };
  }
}
