import { NextResponse } from "next/server";
import { getMobileSession } from "@/lib/mobileAuth";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const session = getMobileSession(req);
    const userId = session.id;

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("Server misconfiguration");

    // Create a short-lived token just for the preview renderer
    const token = jwt.sign({ userId, purpose: "preview" }, secret, { expiresIn: "5m" });

    return NextResponse.json({ token });
  } catch (error: any) {
    if (error.message?.includes("Missing") || error.message?.includes("jwt")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
