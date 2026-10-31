import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const forSaleOnly = searchParams.get("forSale") === "true";
    const tech        = searchParams.get("tech");
    const sort        = searchParams.get("sort") || "newest";  // newest | views | featured
    const limit       = Math.min(Number(searchParams.get("limit") || 48), 100);

    const filter: any = {
      status: "completed",
      "showcase.isPublic": true,
    };
    if (forSaleOnly) filter["marketplace.forSale"] = true;
    if (tech)        filter.techStack = tech;

    const sortMap: Record<string, any> = {
      newest:   { completedAt: -1 },
      views:    { showcaseViews: -1, completedAt: -1 },
      featured: { "showcase.featured": -1, completedAt: -1 },
    };

    const projects = await Project.find(filter)
      .populate("lead", "name avatar")
      .populate("orgId", "name slug")
      .sort(sortMap[sort] || sortMap.newest)
      .limit(limit)
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(projects)));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
