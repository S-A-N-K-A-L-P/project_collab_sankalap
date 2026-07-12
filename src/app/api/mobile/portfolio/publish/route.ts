import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import { snapshotPublishable } from "@/components/portfolio/publish";
import { defaultSections } from "@/components/portfolio/sections";

export async function POST(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;
    await dbConnect();

    let pf = await Portfolio.findOne({ userId });
    if (!pf) {
      pf = new Portfolio({ userId, sections: defaultSections() });
    }

    pf.published = snapshotPublishable(pf.toObject());
    pf.markModified("published");
    pf.lastPublishedAt = new Date();
    await pf.save();

    return NextResponse.json({ 
      ok: true, 
      published: pf.published, 
      lastPublishedAt: pf.lastPublishedAt 
    });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
