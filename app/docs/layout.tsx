import Link from "next/link";
import { Sidebar } from "@/components/site/sidebar";
import { MobileNav } from "@/components/site/mobile-nav";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { LauncherButton } from "@/components/site/launcher";
import { Logo } from "@/components/site/logo";
import { Ring } from "@/components/site/ring";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* pinned to the viewport: the document itself never scrolls, only the
       two panes inside it do */
    <div className="docs-page fixed inset-0 flex overflow-hidden">
      <aside className="docs-side z-30 hidden h-full w-[256px] shrink-0 px-2 pt-2 lg:block">
        <Ring size={430} className="docs-ring absolute -bottom-[170px] -left-[130px] text-ink" />
        <div className="relative z-[1] h-full">
          <Sidebar />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="scroll-inset h-full overflow-y-auto overflow-x-hidden overscroll-contain">
          <header className="docs-head sticky top-0 z-20 flex h-12 items-center gap-2.5 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
            <Link href="/docs" className="lg:hidden">
              <Logo size={14} />
            </Link>
            <MobileNav />
            <div className="hidden min-w-0 lg:block">
              <Breadcrumb />
            </div>
            <span className="flex-1" />
            <LauncherButton />
            <ThemeToggle />
          </header>

          <div className="pointer-events-none sticky top-12 z-10 -mb-12 h-12" style={{ background: "linear-gradient(to bottom, var(--page), color-mix(in oklab, var(--page) 80%, transparent) 50%, transparent)" }} />

          {children}

          <div className="pointer-events-none sticky bottom-0 z-10 -mt-16 h-16" style={{ background: "linear-gradient(to top, var(--page), color-mix(in oklab, var(--page) 80%, transparent) 50%, transparent)" }} />
        </div>
      </div>
    </div>
  );
}
