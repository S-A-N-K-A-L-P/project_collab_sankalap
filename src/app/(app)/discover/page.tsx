import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Image from "next/image";
import Link from "next/link";
import ConnectButton from "@/components/profile/ConnectButton";
import { MapPin, Users, Compass, Search } from "lucide-react";

type DiscoverProps = {
  searchParams?: Promise<{ q?: string; role?: string }>;
};

export default async function DiscoverPage({ searchParams }: DiscoverProps) {
  await dbConnect();

  const resolvedParams = searchParams ? await searchParams : {};
  const q = (resolvedParams?.q || "").trim();
  const activeRole = (resolvedParams?.role || "all").trim();

  const filter: Record<string, any> = { role: { $ne: "admin" } };
  if (activeRole !== "all") {
    filter.role = activeRole;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { skills: { $elemMatch: { $regex: q, $options: "i" } } },
      { universityName: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  const developers = await User.find(filter)
    .select("name avatar role universityName location skills")
    .limit(18)
    .lean();

  const roleLabel = (role: string) =>
    (role || "user").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const rolePill = (role: string) => {
    if (role === "master_admin")      return "pill-error";
    if (role === "sankalp_associate") return "pill-primary";
    if (role === "sankalp_member")    return "pill-info";
    return "pill-neutral";
  };

  const roles = [
    { id: "all",               label: "All Contributors"  },
    { id: "sankalp_member",    label: "Madhyam Members"   },
    { id: "sankalp_associate", label: "Madhyam Associates"},
    { id: "user",              label: "Builders"          },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="saas-card-featured p-6 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/15 text-[11px] font-semibold text-primary">
              <Compass className="w-3.5 h-3.5" />
              Community Directory
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Discover Contributors</h1>
            <p className="text-sm text-muted leading-relaxed max-w-xl">
              Explore verified builders, researchers, and collaborators across the Madhyam AI network.
            </p>
          </div>
          <div className="saas-card px-4 py-2.5 text-right self-start sm:self-auto shrink-0">
            <div className="text-xl font-bold text-primary tabular-nums leading-none">{developers.length}</div>
            <div className="text-[11px] font-medium text-muted mt-1">Contributors</div>
          </div>
        </div>

        {/* Search & Role Category Filter Bar */}
        <div className="mt-5 pt-4 border-t border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form method="GET" action="/discover" className="relative flex-1 max-w-md">
            {activeRole !== "all" && <input type="hidden" name="role" value={activeRole} />}
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Filter by name, skill, university, or city…"
              className="w-full pl-9 pr-3.5 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </form>

          <div className="flex flex-wrap gap-1.5">
            {roles.map(r => {
              const isSelected = activeRole === r.id;
              const href = r.id === "all"
                ? (q ? `/discover?q=${encodeURIComponent(q)}` : "/discover")
                : `/discover?role=${encodeURIComponent(r.id)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
              return (
                <Link
                  key={r.id}
                  href={href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-white shadow-[0_2px_8px_-2px_rgba(98,87,232,0.38)]"
                      : "bg-card border-border text-muted hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {r.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {developers.map((dev: any) => (
          <div
            key={dev._id.toString()}
            className="saas-card p-5 hover:border-primary/35 hover:shadow-[var(--shadow-md)] transition-all duration-200 flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-primary-light border border-primary/15 overflow-hidden flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {dev.avatar ? (
                    <Image src={dev.avatar} alt={dev.name} width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    (dev.name?.[0] || "U").toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/profile/${dev._id}`}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {dev.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full ${rolePill(dev.role)}`}>
                      {roleLabel(dev.role)}
                    </span>
                  </div>
                </div>
              </div>
              <ConnectButton targetId={dev._id.toString()} initialIsConnected={false} variant="icon" />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border">
              {(dev.location || dev.universityName) && (
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {[dev.location, dev.universityName].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}

              {dev.skills && dev.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {dev.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="pill-info text-[10.5px] font-medium px-2.5 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {dev.skills.length > 4 && (
                    <span className="text-[10.5px] text-muted font-medium self-center">+{dev.skills.length - 4} more</span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted">Active contributor on Madhyam AI</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {developers.length === 0 && (
        <div className="saas-card text-center py-16 px-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">No contributors found</p>
          <p className="text-xs text-muted mt-1">Try adjusting your search or role filter.</p>
        </div>
      )}
    </div>
  );
}
