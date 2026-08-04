"use client";

import { useState } from "react";
import { ArrowUpRight, Building2, Mail, MapPin } from "lucide-react";
import type { IOrgMemberPopulated, IOrgPublic } from "@/types/org";

interface Props {
  org: IOrgPublic;
  portfolio: any;
  members: IOrgMemberPopulated[];
  projects: any[];
  contained?: boolean;
}

const NAV_TYPES = new Set([
  "mission",
  "services",
  "projects_showcase",
  "clients",
  "team",
  "news",
  "events",
  "locations",
  "contact",
]);

export default function EnterpriseOrgRenderer({
  org,
  portfolio,
  members,
  projects,
  contained = false,
}: Props) {
  const sections = (portfolio?.sections || [])
    .filter((section: any) => section.enabled !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const template = portfolio?.enterpriseTemplate || "corporate";
  const navigation = portfolio?.navigationStyle || "horizontal";
  const pages = (portfolio?.enterprisePages || []).slice(0, 4);
  const multiPage = portfolio?.enterprisePageMode === "multi_page" && pages.length > 0;
  const [activePage, setActivePage] = useState(pages[0]?.id || "home");
  const brand = {
    surface:
      portfolio?.enterpriseBrand?.surface ||
      (template === "editorial" ? "#f4efe5" : "#f8f7f3"),
    text: portfolio?.enterpriseBrand?.text || "#172033",
    accent:
      portfolio?.enterpriseBrand?.accent ||
      (template === "editorial" ? "#7b3f2b" : "#244a73"),
  };
  const navSections = sections
    .filter((section: any) => NAV_TYPES.has(section.type))
    .slice(0, 4);
  const navItems = multiPage ? pages.map((page: any) => ({ id: page.id, title: page.label })) : navSections;
  const visibleSections = multiPage
    ? sections.filter((section: any) => section.type === "hero" || (section.pageId || pages[0]?.id) === activePage)
    : sections;
  const contentClass = template === "editorial" ? "font-serif" : "font-sans";

  return (
    <div
      className={`${contained ? "min-h-full" : "min-h-screen"} ${contentClass}`}
      style={{ background: brand.surface, color: brand.text }}
    >
      {navigation === "horizontal" ? (
        <HorizontalHeader
          org={org}
          sections={navItems}
          accent={brand.accent}
          multiPage={multiPage}
          activePage={activePage}
          onNavigate={setActivePage}
        />
      ) : null}
      <div
        className={
          navigation === "vertical"
            ? "mx-auto grid max-w-[1440px] lg:grid-cols-[250px_1fr]"
            : ""
        }
      >
        {navigation === "vertical" ? (
          <VerticalHeader
            org={org}
            sections={navItems}
            accent={brand.accent}
            multiPage={multiPage}
            activePage={activePage}
            onNavigate={setActivePage}
          />
        ) : null}
        <main>
          {(!multiPage || activePage === pages[0]?.id) && <EnterpriseHero org={org} accent={brand.accent} template={template} />}
          {visibleSections
            .filter((section: any) => section.type !== "hero")
            .map((section: any) => (
              <EnterpriseSection
                key={section.id}
                section={section}
                org={org}
                members={members}
                projects={projects}
                accent={brand.accent}
                template={template}
              />
            ))}
          <footer className="border-t border-black/10 px-6 py-10 md:px-10">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-sm md:flex-row">
              <div>
                <div className="font-semibold">{org.name}</div>
                <div className="mt-1 max-w-md text-xs leading-5 opacity-60">
                  {portfolio?.enterpriseFooter?.summary ||
                    org.tagline ||
                    org.description}
                </div>
              </div>
              <div className="text-xs opacity-60">
                © {new Date().getFullYear()}{" "}
                {portfolio?.enterpriseFooter?.copyright ||
                  `${org.name}. All rights reserved.`}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Brand({ org }: { org: IOrgPublic }) {
  return (
    <a href="#top" className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-white">
        {org.logo || org.avatar ? (
          <img
            src={org.logo || org.avatar}
            alt={`${org.name} logo`}
            className="h-full w-full object-contain"
          />
        ) : (
          <Building2 size={18} />
        )}
      </span>
      <span className="truncate text-sm font-semibold tracking-tight">
        {org.name}
      </span>
    </a>
  );
}
function HorizontalHeader({ org, sections, accent, multiPage, activePage, onNavigate }: any) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 px-6 backdrop-blur md:px-10">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6">
        <Brand org={org} />
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {sections.map((section: any) => multiPage ? (
            <button key={section.id} aria-current={activePage === section.id ? "page" : undefined} onClick={() => onNavigate(section.id)} className={`text-xs font-medium transition-opacity ${activePage === section.id ? "opacity-100" : "opacity-55 hover:opacity-100"}`}>{section.title}</button>
          ) : (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-xs font-medium opacity-65 transition-opacity hover:opacity-100"
            >
              {section.title}
            </a>
          ))}
          {!multiPage && <a
            href="#contact"
            className="rounded-md px-4 py-2 text-xs font-semibold text-white"
            style={{ background: accent }}
          >
            Contact us
          </a>}
        </nav>
      </div>
    </header>
  );
}
function VerticalHeader({ org, sections, accent, multiPage, activePage, onNavigate }: any) {
  return (
    <aside className="border-r border-black/10 bg-white px-7 py-8 lg:sticky lg:top-0 lg:h-screen">
      <Brand org={org} />
      <nav aria-label="Primary navigation" className="mt-12 flex gap-5 overflow-x-auto lg:flex-col">
        {sections.map((section: any, index: number) => multiPage ? (
          <button key={section.id} aria-current={activePage === section.id ? "page" : undefined} onClick={() => onNavigate(section.id)} className={`flex items-center gap-3 whitespace-nowrap text-left text-sm ${activePage === section.id ? "opacity-100" : "opacity-55 hover:opacity-100"}`}><span className="text-[10px]" style={{ color: accent }}>0{index + 1}</span>{section.title}</button>
        ) : (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex items-center gap-3 whitespace-nowrap text-sm opacity-60 hover:opacity-100"
          >
            <span className="text-[10px]" style={{ color: accent }}>
              0{index + 1}
            </span>
            {section.title}
          </a>
        ))}
      </nav>
      <div className="mt-12 hidden text-xs opacity-50 lg:block">
        {org.email || org.website}
      </div>
    </aside>
  );
}
function EnterpriseHero({ org, accent, template }: any) {
  return (
    <section id="top" className="px-6 py-16 md:px-10 md:py-24">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-12 ${org.bannerImage || org.banner ? "lg:grid-cols-[1.05fr_.95fr]" : ""}`}
      >
        <div>
          <div
            className="mb-5 text-xs font-semibold uppercase tracking-[.2em]"
            style={{ color: accent }}
          >
            {String(org.category || "organization").replaceAll("_", " ")}
          </div>
          <h1
            className={`${template === "editorial" ? "text-5xl leading-[1.04] md:text-7xl" : "text-4xl leading-tight md:text-6xl"} max-w-4xl font-semibold tracking-[-.035em]`}
          >
            {org.name}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 opacity-65 md:text-lg">
            {org.tagline || org.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              Start a conversation <ArrowUpRight size={15} />
            </a>
            {org.website && (
              <a
                href={org.website}
                className="rounded-md border border-black/15 bg-white px-5 py-3 text-sm font-medium"
              >
                Visit website
              </a>
            )}
          </div>
        </div>
        {(org.bannerImage || org.banner) && (
          <div className="aspect-[4/3] overflow-hidden rounded-sm bg-black/5">
            <img
              src={org.bannerImage || org.banner}
              alt={`${org.name} workplace`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function EnterpriseSection({
  section,
  org,
  members,
  projects,
  accent,
  template,
}: any) {
  const content = section.content || {};
  const wrap = `px-6 py-16 md:px-10 md:py-24 ${section.order % 2 ? "bg-white/65" : ""}`;
  if (
    section.type === "mission" ||
    section.type === "about" ||
    section.type === "custom"
  )
    return (
      <section id={section.id} className={wrap}>
        <Shell eyebrow="About us" title={section.title} template={template}>
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <p
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: accent }}
            >
              {org.charter || "Our purpose"}
            </p>
            <p className="text-base leading-8 opacity-70">
              {content.body || org.charter || org.description}
            </p>
          </div>
        </Shell>
      </section>
    );
  if (section.type === "projects_showcase" || section.type === "projects") {
    const items = projects.slice(0, content.limit || 6);
    return (
      <section id={section.id} className={wrap}>
        <Shell
          eyebrow="Selected work"
          title={section.title}
          template={template}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((project: any) => (
              <article
                key={project._id}
                className="group border-t border-black/15 pt-5"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black/5">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs opacity-40">
                      Project image
                    </div>
                  )}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{project.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-60">
                  {project.description}
                </p>
              </article>
            ))}
          </div>
        </Shell>
      </section>
    );
  }
  if (section.type === "team") {
    const people = members.slice(0, content.limit || 8);
    return (
      <section id={section.id} className={wrap}>
        <Shell
          eyebrow="Leadership & team"
          title={section.title}
          template={template}
        >
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4">
            {people.map((member: any) => (
              <article key={member._id}>
                <div className="aspect-[4/5] overflow-hidden bg-black/5">
                  {member.userId?.avatar ? (
                    <img
                      src={member.userId.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl opacity-25">
                      {member.userId?.name?.[0]}
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold">
                  {member.userId?.name}
                </h3>
                <p className="mt-1 text-xs capitalize opacity-55">
                  {member.role}
                </p>
              </article>
            ))}
          </div>
        </Shell>
      </section>
    );
  }
  if (section.type === "sponsors")
    return (
      <section id={section.id} className={wrap}>
        <Shell
          eyebrow="Trusted by"
          title={section.title || "Clients & partners"}
          template={template}
        >
          <div className="grid grid-cols-2 border-l border-t border-black/10 md:grid-cols-4">
            {(content.items || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.url || "#"}
                className="flex min-h-28 items-center justify-center border-b border-r border-black/10 bg-white p-6"
              >
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="max-h-10 max-w-full object-contain grayscale"
                  />
                ) : (
                  <span className="text-sm font-semibold opacity-50">
                    {item.name || "Client"}
                  </span>
                )}
              </a>
            ))}
          </div>
        </Shell>
      </section>
    );
  if (section.type === "services")
    return (
      <section id={section.id} className={wrap}>
        <Shell eyebrow="Capabilities" title={section.title} template={template}>
          <div className="grid border-l border-t border-black/10 md:grid-cols-3">
            {(content.items || []).map((item: any, index: number) => (
              <article
                key={index}
                className="border-b border-r border-black/10 bg-white/60 p-7"
              >
                <div
                  className="text-xs font-semibold"
                  style={{ color: accent }}
                >
                  0{index + 1}
                </div>
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="mt-5 aspect-[16/10] w-full object-cover"
                  />
                )}
                <h3 className="mt-6 text-lg font-semibold">
                  {item.title || "Service"}
                </h3>
                <p className="mt-3 text-sm leading-6 opacity-60">
                  {item.description}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    className="mt-5 inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    Learn more <ArrowUpRight size={13} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </Shell>
      </section>
    );
  if (section.type === "clients" || section.type === "sponsors")
    return (
      <section id={section.id} className={wrap}>
        <Shell
          eyebrow="Trusted by"
          title={section.title || "Clients & partners"}
          template={template}
        >
          <div className="grid grid-cols-2 border-l border-t border-black/10 md:grid-cols-4">
            {(content.items || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.url || "#"}
                className="flex min-h-28 items-center justify-center border-b border-r border-black/10 bg-white p-6"
              >
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="max-h-10 max-w-full object-contain grayscale"
                  />
                ) : (
                  <span className="text-sm font-semibold opacity-50">
                    {item.name || "Client"}
                  </span>
                )}
              </a>
            ))}
          </div>
        </Shell>
      </section>
    );
  if (section.type === "news" || section.type === "events")
    return (
      <section id={section.id} className={wrap}>
        <Shell eyebrow="Latest" title={section.title} template={template}>
          <div className="grid gap-7 md:grid-cols-3">
            {(content.items || []).map((item: any, index: number) => (
              <article key={index} className="border-t border-black/15 pt-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="mb-5 aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="text-xs opacity-45">{item.date}</div>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 opacity-60">
                  {item.summary || item.description}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    Read more <ArrowUpRight size={13} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </Shell>
      </section>
    );
  if (section.type === "locations")
    return (
      <section id={section.id} className={wrap}>
        <Shell
          eyebrow="Where to find us"
          title={section.title}
          template={template}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {(content.items || []).map((item: any, index: number) => (
              <article
                key={index}
                className="grid overflow-hidden border border-black/10 bg-white sm:grid-cols-2"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="h-full min-h-48 w-full object-cover"
                  />
                ) : (
                  <div className="min-h-48 bg-black/5" />
                )}
                <div className="p-6">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 opacity-60">
                    {item.address}
                  </p>
                  <div className="mt-4 text-xs opacity-55">
                    {item.email}
                    <br />
                    {item.phone}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Shell>
      </section>
    );
  if (section.type === "contact")
    return (
      <section id="contact" className={wrap}>
        <Shell
          eyebrow="Contact"
          title={section.title || "Let’s work together"}
          template={template}
        >
          <div className="grid gap-8 border-t border-black/15 pt-8 md:grid-cols-3">
            <ContactLine
              icon={<Mail size={17} />}
              label="Email"
              value={org.email}
              href={org.email ? `mailto:${org.email}` : undefined}
            />
            <ContactLine
              icon={<ArrowUpRight size={17} />}
              label="Website"
              value={org.website}
              href={org.website}
            />
            <ContactLine
              icon={<MapPin size={17} />}
              label="Organization"
              value={org.name}
            />
          </div>
        </Shell>
      </section>
    );
  return null;
}
function Shell({ eyebrow, title, template, children }: any) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 md:mb-14">
        <div className="text-[11px] font-semibold uppercase tracking-[.2em] opacity-45">
          {eyebrow}
        </div>
        <h2
          className={`${template === "editorial" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"} mt-3 font-semibold tracking-[-.025em]`}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
function ContactLine({ icon, label, value, href }: any) {
  const body = (
    <div className="flex gap-3">
      <span className="mt-0.5 opacity-45">{icon}</span>
      <div>
        <div className="text-xs uppercase tracking-wider opacity-45">
          {label}
        </div>
        <div className="mt-2 text-sm font-medium">
          {value || "Available on request"}
        </div>
      </div>
    </div>
  );
  return href ? <a href={href}>{body}</a> : body;
}
