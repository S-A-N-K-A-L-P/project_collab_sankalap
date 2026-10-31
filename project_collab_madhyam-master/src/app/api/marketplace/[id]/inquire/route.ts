import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import MarketplaceInquiry from "@/models/MarketplaceInquiry";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body   = await req.json();
    const { buyerName, buyerEmail, buyerOrg, message } = body;

    if (!buyerName?.trim() || !buyerEmail?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(buyerEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const project = await Project.findOne({ _id: id, status: "completed", "marketplace.forSale": true });
    if (!project) {
      return NextResponse.json({ error: "Project is not currently for sale" }, { status: 404 });
    }

    await MarketplaceInquiry.create({
      projectId: id,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim().toLowerCase(),
      buyerOrg: (buyerOrg || "").trim(),
      message: message.trim(),
      status: "new",
    });

    await Project.findByIdAndUpdate(id, { $inc: { "marketplace.inquiriesCount": 1 } });

    return NextResponse.json({ ok: true, message: "Inquiry submitted. The project owner will be in touch." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
