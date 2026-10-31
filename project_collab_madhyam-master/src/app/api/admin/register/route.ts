import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      password,
      universityName,
      enrollmentNumber,
      techStackPreference,
    } = await req.json();

    if (!name || !email || !password || !universityName || !enrollmentNumber || !techStackPreference) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      password: hashedPassword,
      universityName,
      enrollmentNumber,
      techStackPreference,
      role: "admin",
    });

    return NextResponse.json({ message: "Admin account created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}
