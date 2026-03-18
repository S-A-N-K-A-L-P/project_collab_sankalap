import dbConnect from "@/lib/mongodb";
import Proposal from "@/models/Proposal";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminControls from "./AdminControls";
import { ShieldAlert } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  await dbConnect();
  const user = await User.findOne({ email: session?.user?.email });
  
  if (user?.role !== "pixel_head") {
    redirect("/feed");
  }

  const rawProposals = await Proposal.find({ status: "proposal" })
    .populate("createdBy", "name role")
    .sort({ votes: -1 })
    .lean();

  const rawLeads = await User.find({ role: { $in: ["project_lead", "pixel_member"] } }).lean();

  const proposals = JSON.parse(JSON.stringify(rawProposals));
  const leads = JSON.parse(JSON.stringify(rawLeads));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#121214] p-8 rounded-2xl border border-[#1f1f23] shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-[#e5e7eb]">Control Room</h1>
        <p className="text-[#9ca3af] text-[13px] font-medium mt-2 leading-relaxed">Manage technical protocol proposals and assign node architects.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-1 mb-4">
            <ShieldAlert className="w-4 h-4 text-[#6366f1]" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9ca3af] font-mono">Pending Authorizations</h2>
        </div>

        {proposals.length === 0 ? (
          <div className="p-16 text-center bg-[#121214] rounded-2xl border border-[#1f1f23]">
            <p className="text-[#1f1f23] font-mono text-[11px] uppercase tracking-widest font-black">Null pending protocols found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {proposals.map((p: any) => (
                <div key={p._id} className="bg-[#121214] border border-[#1f1f23] rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-[#2a2a2f] transition-all group">
                <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 rounded text-[10px] font-bold uppercase tracking-[0.05em] font-mono">{p.type}</span>
                    <span className="text-[10px] text-[#9ca3af] font-bold uppercase font-mono tracking-tight">Endorsements: {p.votes}</span>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#e5e7eb] tracking-tight">{p.title}</h3>
                    <p className="text-[13px] text-[#9ca3af] line-clamp-2 leading-relaxed font-medium">{p.description}</p>
                    <p className="text-[10px] text-[#1f1f23] font-mono font-bold uppercase tracking-widest pt-1">
                        Broadcast by <span className="text-[#9ca3af]">{p.createdBy.name}</span>
                    </p>
                </div>

                <div className="flex items-center">
                    <AdminControls proposalId={p._id.toString()} leads={leads} />
                </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
