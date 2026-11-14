import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import User from "@/models/User";
import type { OrgWithNode } from "@/lib/orgNode";
import NodeConsole from "@/components/org/NodeConsole";

export const dynamic = "force-dynamic";

/**
 * /orgs/<slug>/console/<path> — the org console shell (Syncro.Desktop docs/org-server/admindashboard-syncro.md §3).
 * One org read (+ the host's first name); everything after that runs between the visitor's browser and the org's node.
 * <path> is the node UI's route and is read on the client.
 */
export default async function OrgConsolePage({ params }: { params: Promise<{ slug: string; path?: string[] }> }) {
  const { slug } = await params;
  await dbConnect();
  const org = await Org.findOne({ slug, status: "active" })
    .select("name slug node.nodeId node.url node.pairedBy node.lastOnlineAt")
    .lean<OrgWithNode>();
  if (!org) notFound();

  let hostName = "";
  if (org.node?.pairedBy) {
    const u = await User.findById(org.node.pairedBy).select("name").lean<{ name?: string }>();
    hostName = u?.name?.split(" ")[0] ?? "";
  }

  return (
    <NodeConsole
      slug={org.slug}
      orgName={org.name}
      nodeId={org.node?.nodeId ?? null}
      nodeUrl={org.node?.url ?? null}
      hostName={hostName}
      lastOnlineAt={org.node?.lastOnlineAt ? new Date(org.node.lastOnlineAt).toISOString() : null}
    />
  );
}
