import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const userId = (session.user as any).id;
  const memberships = await OrgMember.find({ userId, status: "active", role: { $in: ["owner", "admin"] } }).select("orgId role").lean();
  const orgIds = memberships.map((membership: any) => membership.orgId);
  const organizations = await Org.find({ _id: { $in: orgIds }, status: { $in: ["approved", "active"] } }).select("name slug logo tagline status").sort({ name: 1 }).lean();
  return NextResponse.json({ organizations: JSON.parse(JSON.stringify(organizations)) });
}
