export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
}
