import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Parked above the viewport; slides into view on focus. See globals.css. */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <SiteHeader />

      {/*
        tabIndex={-1} makes this a valid target for the skip link, so focus
        actually moves here rather than only the scroll position.
      */}
      <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </div>

      <SiteFooter />
    </div>
  );
}
