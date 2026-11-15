import Image from "next/image";
import Link from "next/link";
import { BRAND } from "./content";

/** S.A.N.K.A.L.P. logo and name, with "Powered by Morwin Technologies" in small text underneath. */
export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 shrink-0" aria-label={`${BRAND.name} home`}>
      <span className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
        <Image src={BRAND.logo} alt="" fill sizes="36px" className="object-cover" priority />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">{BRAND.name}</span>
        <PoweredBy className="mt-1" />
      </span>
    </Link>
  );
}

export function PoweredBy({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 ${className}`}>
      powered by
      {BRAND.companyLogo ? (
        <span className="relative inline-block h-3.5 w-16">
          <Image src={BRAND.companyLogo} alt={BRAND.company} fill sizes="64px" className="object-contain object-left" />
        </span>
      ) : (
        <span className="font-semibold text-slate-700 dark:text-slate-300">{BRAND.company}</span>
      )}
    </span>
  );
}
