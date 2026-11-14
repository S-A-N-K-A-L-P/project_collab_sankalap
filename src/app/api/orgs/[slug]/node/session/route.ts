import { NextResponse } from "next/server";
import Org from "@/models/Org";
import { verifyNodeCall } from "@/lib/orgNode";

/**
 * DELETE /api/orgs/[slug]/node/session — signed "going offline" on a clean stop (gitupgrades.md §11.2).
 * If the PC crashes and never sends this, nothing breaks: the visitor's browser probe fails and shows offline.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const call = await verifyNodeCall(req, slug);
  if (call instanceof NextResponse) return call;
  await Org.updateOne(
    { _id: call.org._id, "node.nodeId": call.org.node.nodeId },
    { $set: { "node.url": null, "node.lastOfflineAt": new Date() } },
  );
  return NextResponse.json({ ok: true });
}
