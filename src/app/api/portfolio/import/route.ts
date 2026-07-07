import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import { defaultSections, sanitizeImportedSections } from "@/components/portfolio/sections";

const STR = (v: any) => (typeof v === "string" ? v : "");
const BOOL = (v: any, d: boolean) => (typeof v === "boolean" ? v : d);

/** POST a portfolio JSON ({ version, theme, background, meta, sections }) → applies it. */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    await dbConnect();

    const json = await req.json();
    if (!json || typeof json !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const sections = sanitizeImportedSections(json.sections) ?? defaultSections();
    const theme = json.theme || {};
    const bg = json.background || {};
    const meta = json.meta || {};

    let pf = await Portfolio.findOne({ userId });
    if (!pf) pf = new Portfolio({ userId });

    pf.themeId          = STR(theme.id) || pf.themeId || "aurora";
    pf.accent           = STR(theme.accent);
    pf.accent2          = STR(theme.accent2);
    pf.card             = STR(theme.card);
    pf.sectionAnim      = STR(theme.sectionAnim) || "rise";
    pf.projectCardStyle = STR(theme.projectCardStyle) || "glass";
    pf.projectCardAnim  = STR(theme.projectCardAnim) || "rise";
    pf.bgOverride       = STR(bg.effect);
    pf.threeOverride    = STR(bg.scene);
    pf.heavy3d          = BOOL(bg.heavy3d, false);
    if (meta.seo && typeof meta.seo === "object") {
      pf.seo = { title: STR(meta.seo.title), description: STR(meta.seo.description) };
    }
    if (typeof meta.isPublished === "boolean") pf.isPublished = meta.isPublished;

    pf.sections = sections as any;
    pf.markModified("sections");

    await pf.save();
    return NextResponse.json({ ok: true, portfolio: JSON.parse(JSON.stringify(pf)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Import failed" }, { status: 500 });
  }
}
