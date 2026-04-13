import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, universityName, enrollmentNumber, techStackPreference, password, role } = await req.json();

    if (!name || !email || !universityName || !enrollmentNumber || !techStackPreference || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      universityName,
      enrollmentNumber,
      techStackPreference,
      password: hashedPassword,
      role: role || "normal_user",
    });

    return NextResponse.json({ message: "User registered successfully", userId: user._id }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration", error: error.message }, { status: 500 });
  }
}
