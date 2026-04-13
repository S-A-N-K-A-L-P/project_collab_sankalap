import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Image from "next/image";
import Link from "next/link";
import ConnectButton from "@/components/profile/ConnectButton";
import { Search, MapPin, Code2 } from "lucide-react";

export default async function DiscoverPage() {
  await dbConnect();

  const developers = await User.find({ role: { $ne: "admin" } })
    .select("name avatar role universityName location skills")
    .limit(12)
    .lean();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-surface p-8 rounded-2xl border border-border-subtle shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Nodes</h1>
        <p className="text-muted text-[13px] font-medium mt-2 leading-relaxed">Connect with verified builders and architects within the Pixel collective.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {developers.map((dev: any) => (
          <div key={dev._id.toString()} className="bg-surface border border-border-subtle rounded-2xl p-5 hover:border-border-strong transition-all duration-150 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-alt border border-border-subtle overflow-hidden flex items-center justify-center text-foreground font-bold">
                  {dev.avatar ? (
                    <Image src={dev.avatar} alt={dev.name} width={48} height={48} className="object-cover" />
                  ) : (
                    dev.name[0]
                  )}
                </div>
                <div>
                  <Link href={`/profile/${dev._id}`} className="text-[15px] font-bold text-foreground hover:underline underline-offset-4 decoration-1">
                    {dev.name}
                  </Link>
                  <p className="text-[11px] font-mono font-bold text-accent uppercase tracking-widest mt-0.5">
                    {dev.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <ConnectButton targetId={dev._id.toString()} initialIsConnected={false} variant="icon" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
                <MapPin className="w-3.5 h-3.5 text-muted" />
                {dev.location || "Location Unknown"} • {dev.universityName}
              </div>

              {dev.skills && dev.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dev.skills.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-[10px] font-mono font-bold text-muted bg-surface-alt px-2 py-0.5 rounded border border-border-subtle uppercase">
                      {skill}
                    </span>
                  ))}
                  {dev.skills.length > 3 && <span className="text-[9px] text-border-strong font-mono font-bold">+{dev.skills.length - 3}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
