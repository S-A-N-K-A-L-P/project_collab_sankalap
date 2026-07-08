import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import {
  PlatformConfig,
  PlatformConfigHistory,
  CONFIG_SECTIONS,
  CONFIG_DEFAULTS,
  getOrSeedConfig,
  type ConfigSection,
} from "@/models/PlatformConfig";
import { isMasterAdmin } from "@/lib/roles";

/**
 * Shape validation against the seed defaults (docs/config.md §3):
 * every top-level key in the payload must exist in the section's default
 * shape and carry the same primitive type. Rejected wholesale — no partial
 * writes. Nested objects are checked one level deep; arrays are accepted
 * as-is (badge lists, pricing bands vary in length by design).
 */
function validateSection(section: ConfigSection, payload: any): string | null {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return "Payload must be an object";
  }
  const defaults = CONFIG_DEFAULTS[section];
  for (const key of Object.keys(payload)) {
    if (!(key in defaults)) return `Unknown key "${key}" for section "${section}"`;
    const defVal = (defaults as any)[key];
    const newVal = payload[key];
    if (Array.isArray(defVal)) {
      if (!Array.isArray(newVal)) return `"${key}" must be an array`;
    } else if (defVal !== null && typeof defVal === "object") {
      if (newVal === null || typeof newVal !== "object" || Array.isArray(newVal)) {
        return `"${key}" must be an object`;
      }
    } else if (defVal !== null && newVal !== null && typeof newVal !== typeof defVal) {
      return `"${key}" must be a ${typeof defVal}`;
    }
  }
  return null;
}

/** PATCH /api/admin/config/[section] — update one section (master_admin only) */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (!isMasterAdmin(role)) {
      return NextResponse.json({ message: "Forbidden — master_admin only" }, { status: 403 });
    }

    const { section } = await params;
    if (!CONFIG_SECTIONS.includes(section as ConfigSection)) {
      return NextResponse.json({ message: `Unknown config section "${section}"` }, { status: 400 });
    }

    const payload = await req.json();
    const validationError = validateSection(section as ConfigSection, payload);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    await dbConnect();
    const cfg = await getOrSeedConfig();

    const oldValue = JSON.parse(JSON.stringify(cfg[section] ?? {}));
    const newValue = { ...oldValue, ...payload };
    const newVersion = (cfg.version || 1) + 1;

    // Audit first, then write — a failed write leaves a dangling audit row,
    // which is preferable to an unaudited config change.
    await PlatformConfigHistory.create({
      version: newVersion,
      section,
      oldValue,
      newValue,
      changedBy: (session.user as any).id,
      changedByName: (session.user as any).name || (session.user as any).email || "",
    });

    const updated = await PlatformConfig.findOneAndUpdate(
      { key: "platform" },
      {
        $set: {
          [section]: newValue,
          version: newVersion,
          updatedBy: (session.user as any).id,
        },
      },
      { new: true }
    );

    return NextResponse.json({ config: JSON.parse(JSON.stringify(updated)) });
  } catch (error: any) {
    console.error("[PATCH /api/admin/config/[section]]", error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
