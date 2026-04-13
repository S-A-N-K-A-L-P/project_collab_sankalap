import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, slug, description, rules, visibility } = await req.json();
    const userId = (session.user as any).id;

    await dbConnect();

    // Create the organization
    const org = await Org.create({
      name,
      slug,
      description,
      rules,
      visibility,
      createdBy: userId,
      admins: [userId],
      members: [userId]
    });

    // Create the membership record for the creator as admin
    await OrgMember.create({
      userId,
      orgId: org._id,
      role: "admin"
    });

    return NextResponse.json(org, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
        return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const orgs = await Org.find({ visibility: "public" })
      .populate("createdBy", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(orgs)));
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
