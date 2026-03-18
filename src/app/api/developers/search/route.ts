import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const role = searchParams.get("role");

    await dbConnect();

    const filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { skills: { $in: [new RegExp(query, "i")] } }
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("name avatar role universityName bio skills")
      .limit(20)
      .lean();

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
