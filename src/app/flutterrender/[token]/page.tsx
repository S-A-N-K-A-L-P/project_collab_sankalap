import { notFound } from "next/navigation";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import User from "@/models/User";
import Project from "@/models/Project";
import { buildPreviewData } from "@/components/portfolio/previewData";
import MobilePortfolioShell from "@/components/portfolio/MobilePortfolioShell";

export default async function FlutterRenderPage({ params }: { params: { token: string } }) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return <div>Server misconfigured</div>;

  let userId: string;
  try {
    const payload = jwt.verify(params.token, secret) as any;
    if (payload.purpose !== "preview" || !payload.userId) throw new Error("Invalid token");
    userId = payload.userId;
  } catch (error) {
    return <div>Preview token expired or invalid. Please refresh the page in the app.</div>;
  }

  await dbConnect();
  
  const [portfolio, user, userProjects] = await Promise.all([
    Portfolio.findOne({ userId }).lean(),
    User.findById(userId).lean(),
    Project.find({ $or: [{ lead: userId }, { members: userId }] }).lean(),
  ]);

  if (!portfolio) {
    return <div>No draft found</div>;
  }

  const data = buildPreviewData(portfolio, user, userProjects);

  return (
    <>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <style>{`
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            user-select: none;
          }
          html {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          ::-webkit-scrollbar { display: none; }
        `}</style>
      </head>
      <MobilePortfolioShell initialData={data} />
    </>
  );
}
