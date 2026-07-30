import Link from "next/link";
import { Sidebar } from "@/components/site/sidebar";
import { MobileNav } from "@/components/site/mobile-nav";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { LauncherButton } from "@/components/site/launcher";
import { Logo } from "@/components/site/logo";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* pinned to the viewport: the document itself never scrolls, only the
       two panes inside it do */
    <div className="fixed inset-0 flex gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5">
      <aside className="hidden h-full w-[236px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mat-panel scroll-inset h-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-[20px]">
          <header className="sticky top-0 z-20 flex h-12 items-center gap-2.5 border-b border-hairline bg-panel/85 px-4 backdrop-blur-md sm:gap-4 sm:px-5">
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

          <div className="pointer-events-none sticky top-12 z-10 -mb-12 h-12 bg-gradient-to-b from-panel via-panel/85 to-transparent" />

          {children}

          <div className="pointer-events-none sticky bottom-0 z-10 -mt-16 h-16 bg-gradient-to-t from-panel via-panel/85 to-transparent" />
        </div>
      </div>
    </div>
  );
}
