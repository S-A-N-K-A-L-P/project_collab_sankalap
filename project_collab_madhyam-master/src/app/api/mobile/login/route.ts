import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * POST /api/mobile/login
 *
 * Dart-friendly stateless login endpoint.
 * Returns a signed JWT (Bearer token) that the mobile app stores securely
 * and sends in the Authorization header for all subsequent requests.
 *
 * Request body:
 *   { "email": "...", "password": "..." }
 *
 * Success response (200):
 *   {
 *     "message": "Login successful",
 *     "token": "<jwt>",
 *     "user": {
 *       "id": "...",
 *       "name": "...",
 *       "email": "...",
 *       "role": "...",
 *       "avatar": "...",
 *       "universityName": "...",
 *       "techStackPreference": "...",
 *       "bio": "...",
 *       "skills": [...],
 *       "reputation": 0
 *     }
 *   }
 *
 * Error responses:
 *   400 – missing fields
 *   401 – wrong password
 *   404 – user not found
 *   500 – server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user with password (password field has select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Sign a JWT valid for 30 days
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret,
      { expiresIn: "30d" }
    );

    // Return safe user object (no password)
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? "",
      universityName: user.universityName,
      enrollmentNumber: user.enrollmentNumber,
      techStackPreference: user.techStackPreference,
      bio: user.bio ?? "",
      skills: user.skills ?? [],
      location: user.location ?? "",
      reputation: user.reputation ?? 0,
    };

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: safeUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[MOBILE_LOGIN_ERROR]", error);
    return NextResponse.json(
      { message: "An error occurred during login", error: error.message },
      { status: 500 }
    );
  }
}
