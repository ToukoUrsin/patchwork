import {
  seedDataset,
  errorResponse,
  requireLocalMutation,
} from "@/server/sanity";
export async function POST(request: Request) {
  try {
    requireLocalMutation(request);
    const payload = await request.json();
    if (payload.confirm !== "seed-public-synthetic-content")
      return Response.json(
        { error: "Explicit fixture confirmation required." },
        { status: 400 },
      );
    return Response.json({ ok: true, ...(await seedDataset()) });
  } catch (error) {
    return errorResponse(error);
  }
}
