/**
 * Tech logos available from /public/tech — used by the Skills section so users
 * can click a logo to add it instead of typing. Skill names are matched against
 * this registry (case-insensitive, + aliases) to render the logo on chips.
 */

export interface TechLogo {
  name: string;       // canonical display name
  file: string;       // path under /tech
  aliases?: string[]; // alternate names that should match this logo
}

export const TECH_LOGOS: TechLogo[] = [
  { name: "AWS",            file: "/tech/aws.jpeg",                  aliases: ["amazon web services"] },
  { name: "Azure",          file: "/tech/azurelogo.jpg",            aliases: ["microsoft azure"] },
  { name: "C#",             file: "/tech/c-sharp-logo-250x281.png", aliases: ["csharp", "c sharp"] },
  { name: "C",              file: "/tech/c.svg" },
  { name: "C++",            file: "/tech/cplusplus.svg",            aliases: ["cpp", "cplusplus"] },
  { name: ".NET",           file: "/tech/dotnet-logo.svg",          aliases: ["dotnet", "asp.net", "net"] },
  { name: "Fedora",         file: "/tech/fedora.svg" },
  { name: "Git",            file: "/tech/git.svg" },
  { name: "GitHub",         file: "/tech/github.svg" },
  { name: "Java",           file: "/tech/java_226777.png" },
  { name: "JavaScript",     file: "/tech/js_5968292.png",           aliases: ["js"] },
  { name: "Kotlin",         file: "/tech/kotlin.png" },
  { name: "Kubernetes",     file: "/tech/kubernetes.png",           aliases: ["k8s"] },
  { name: "OpenCV",         file: "/tech/opencv.png" },
  { name: "PyTorch",        file: "/tech/pytorch.png" },
  { name: "Red Hat",        file: "/tech/rh.svg",                   aliases: ["redhat", "rhel"] },
  { name: "Terraform",      file: "/tech/terraform.png" },
  { name: "Unreal Engine",  file: "/tech/ue5.png",                  aliases: ["ue5", "unreal", "unreal engine 5"] },
];

const LOOKUP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const t of TECH_LOGOS) {
    m[t.name.toLowerCase()] = t.file;
    for (const a of t.aliases || []) m[a.toLowerCase()] = t.file;
  }
  return m;
})();

/** Returns the logo path for a skill name, or "" if none matches. */
export function logoFor(name: string): string {
  if (!name) return "";
  return LOOKUP[name.trim().toLowerCase()] || "";
}
