import { getAuthHandlers } from "@/lib/auth";

export const runtime = "nodejs";

export const GET = (request: Request) => getAuthHandlers().GET(request);
export const POST = (request: Request) => getAuthHandlers().POST(request);
