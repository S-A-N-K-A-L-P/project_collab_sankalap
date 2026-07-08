import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Org from "@/models/Org";
import OrgMember from "@/models/OrgMember";
import User from "@/models/User";

/** Reserved slugs that conflict with static routes under /orgs/* */
const RESERVED_SLUGS = new Set([
  "launch", "status", "admin", "new", "settings", "api", "o",
  "directory", "explore", "create", "request", "join",
]);

/** POST /api/orgs — submit an org launch request (status: "requested") */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body   = await req.json();

    const {
      name, slug, description, category = "community", orgType = "free",
      charter = "", roadmap = "", tagline = "", website = "", email = "",
      socialLinks, logo = "", bannerImage = "", themeColor = "#6366f1",
      visibility = "public", membershipFee = 0,
    } = body;

    if (!name?.trim()) return NextResponse.json({ message: "Name is required" }, { status: 400 });
    if (!slug?.trim()) return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ message: "Description is required" }, { status: 400 });
    if (!charter?.trim()) return NextResponse.json({ message: "Charter (mission) is required" }, { status: 400 });

    const normalizedSlug = slug.trim().toLowerCase();
    if (RESERVED_SLUGS.has(normalizedSlug)) {
      return NextResponse.json({ message: `"${normalizedSlug}" is a reserved slug and cannot be used.` }, { status: 400 });
    }
    if (!/^[a-z0-9-]{3,40}$/.test(normalizedSlug)) {
      return NextResponse.json({ message: "Slug must be 3–40 characters: lowercase letters, numbers, hyphens only." }, { status: 400 });
    }

    await dbConnect();

    // Check slug uniqueness
    const existing = await Org.findOne({ slug: normalizedSlug });
    if (existing) {
      return NextResponse.json({ message: "This slug is already taken. Please choose another." }, { status: 400 });
    }

    // Create the org request
    const org = await Org.create({
      name:         name.trim(),
      slug:         normalizedSlug,
      description:  description.trim(),
      createdBy:    userId,
      ownerId:      userId,
      admins:       [userId],
      members:      [userId],
      status:       "requested",
      category,
      orgType,
      charter:      charter.trim(),
      roadmap:      roadmap.trim(),
      tagline:      tagline.trim(),
      website:      website.trim(),
      email:        email.trim(),
      socialLinks:  socialLinks || {},
      logo,
      bannerImage,
      themeColor,
      visibility,
      membershipFee,
    });

    // Create the membership record (owner, pending until approved)
    await OrgMember.create({
      userId,
      orgId:  org._id,
      role:   "owner",
      status: "active",
    });

    return NextResponse.json(JSON.parse(JSON.stringify(org)), { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "This slug is already taken." }, { status: 400 });
    }
    console.error("[POST /api/orgs]", error);
    return NextResponse.json({ message: error.message || "Internal error" }, { status: 500 });
  }
}

/** GET /api/orgs — list active orgs (public) */
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status   = searchParams.get("status") || "active";
    const category = searchParams.get("category");
    const search   = searchParams.get("search");
    const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit    = Math.min(48, parseInt(searchParams.get("limit") || "24"));

    const filter: any = { status };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name:    { $regex: search, $options: "i" } },
      { tagline: { $regex: search, $options: "i" } },
    ];

    const [orgs, total] = await Promise.all([
      Org.find(filter)
        .populate("ownerId", "name avatar handle")
        .select("-admins -members -review -portfolio")
        .sort({ "stats.memberCount": -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Org.countDocuments(filter),
    ]);

    return NextResponse.json({
      orgs: JSON.parse(JSON.stringify(orgs)),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/orgs]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
