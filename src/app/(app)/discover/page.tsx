import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Image from "next/image";
import Link from "next/link";
import ConnectButton from "@/components/profile/ConnectButton";
import { MapPin, Users } from "lucide-react";

export default async function DiscoverPage() {
  await dbConnect();

  const developers = await User.find({ role: { $ne: "admin" } })
    .select("name avatar role universityName location skills")
    .limit(12)
    .lean();

  const roleLabel = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const roleColor = (role: string) => {
    if (role === "master_admin")      return "bg-red-100 text-red-800";
    if (role === "sankalp_associate") return "bg-indigo-100 text-indigo-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card border-l-4 border-l-primary border border-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Discover Contributors</h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Connect with verified builders and collaborators across the S.A.N.K.A.L.P. network.
        </p>
        <div className="flex items-center gap-2 mt-3 text-sm text-muted">
          <Users className="w-4 h-4" />
          <span>{developers.length} contributor{developers.length !== 1 ? "s" : ""} found</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {developers.map((dev: any) => (
          <div
            key={dev._id.toString()}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-150"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {dev.avatar ? (
                    <Image src={dev.avatar} alt={dev.name} width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    dev.name[0].toUpperCase()
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${dev._id}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {dev.name}
                  </Link>
                  <div className="mt-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor(dev.role)}`}>
                      {roleLabel(dev.role)}
                    </span>
                  </div>
                </div>
              </div>
              <ConnectButton targetId={dev._id.toString()} initialIsConnected={false} variant="icon" />
            </div>

            <div className="mt-3 space-y-2">
              {(dev.location || dev.universityName) && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {[dev.location, dev.universityName].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}

              {dev.skills && dev.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dev.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="text-[10px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {dev.skills.length > 4 && (
                    <span className="text-[10px] text-muted font-medium">+{dev.skills.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {developers.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No contributors found yet.</p>
        </div>
      )}
    </div>
  );
}
