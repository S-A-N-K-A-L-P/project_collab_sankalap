import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import { defaultSections } from "@/components/portfolio/sections";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;
    await dbConnect();

    let pf = await Portfolio.findOne({ userId }).lean();
    if (!pf) {
      // Create empty so they can still export a baseline
      pf = { sections: defaultSections() } as any;
    }

    // Format matches what the web /api/portfolio/export returns
    const exportData = {
      version: 1,
      theme: {
        id: (pf as any).themeId,
        accent: (pf as any).accent,
        accent2: (pf as any).accent2,
        card: (pf as any).card,
        sectionAnim: (pf as any).sectionAnim,
        projectCardStyle: (pf as any).projectCardStyle,
        projectCardAnim: (pf as any).projectCardAnim,
      },
      background: {
        effect: (pf as any).bgOverride,
        scene: (pf as any).threeOverride,
        heavy3d: (pf as any).heavy3d,
      },
      meta: {
        isPublished: (pf as any).isPublished,
        seo: (pf as any).seo,
      },
      sections: (pf as any).sections,
    };

    return NextResponse.json(exportData);
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
