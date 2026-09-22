import {
  commitCommand,
  errorResponse,
  requireLocalMutation,
} from "@/server/sanity";
export async function POST(request: Request) {
  try {
    requireLocalMutation(request);
    const body = await request.text();
    if (body.length > 100_000) throw new Error("Command too large");
    return Response.json({
      ok: true,
      ...(await commitCommand(JSON.parse(body))),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
