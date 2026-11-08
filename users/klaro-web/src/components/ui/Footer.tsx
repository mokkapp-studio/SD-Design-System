import { ReactNode } from 'react';

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

interface FooterProps {
  logo: ReactNode;
  columns?: FooterColumn[];
  bottomText?: string;
  socials?: ReactNode;
}

export default function Footer({ logo, columns = [], bottomText, socials }: FooterProps) {
  return (
    <footer className="w-full bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-16 py-12 flex flex-col gap-8">
        {/* Main row: brand left, nav columns right */}
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          <div className="flex flex-col gap-3 shrink-0 max-w-[200px]">
            {logo}
            {socials && <div className="flex gap-3 mt-1">{socials}</div>}
          </div>
          {columns.length > 0 && (
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {columns.map((col) => (
                <div key={col.heading} className="flex flex-col gap-3">
                  <div className="text-sm font-semibold text-foreground">{col.heading}</div>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>
        {/* Bottom bar */}
        {bottomText && (
          <div className="border-t border-border pt-5 flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">{bottomText}</span>
            <span className="text-xs text-muted-foreground">Made with ♥</span>
          </div>
        )}
      </div>
    </footer>
  );
}
