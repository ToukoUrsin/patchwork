import { snapshot, errorResponse, requireLocalRead } from "@/server/sanity";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    requireLocalRead(request);
    return Response.json(await snapshot(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
