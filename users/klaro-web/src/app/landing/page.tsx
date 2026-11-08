import Hero from '@/components/ui/Hero';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import FeatureCard from '@/components/ui/FeatureCard';
import TestimonialCard from '@/components/ui/TestimonialCard';
import PricingCard from '@/components/ui/PricingCard';
import Footer from '@/components/ui/Footer';

const NAV_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
];

const FEATURES = [
  {
    title: 'Real-time sync',
    description: 'All your data syncs instantly across every device without manual refresh.',
    variant: 'default' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    title: 'Zero config setup',
    description: 'Get started in under a minute. No config files, no boilerplate, no guesswork.',
    variant: 'default' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
  {
    title: 'Built for teams',
    description: 'Role-based access, audit logs, and team workspaces out of the box.',
    variant: 'accent' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  {
    quote: 'This design system saved us weeks of work. The components are well-documented and production-ready from day one.',
    authorName: 'Sofia Martínez',
    authorRole: 'CTO at Velox',
    rating: 5 as const,
  },
  {
    quote: 'Finally a DS that ships with contracts. Our design and dev teams are finally speaking the same language.',
    authorName: 'Lucas Braun',
    authorRole: 'Lead Designer at Stackr',
    rating: 5 as const,
  },
  {
    quote: 'The Figma ↔ code parity is unreal. What you see in Figma is exactly what you get in the browser.',
    authorName: 'Anna Weber',
    authorRole: 'Senior Engineer at Fynlo',
    rating: 5 as const,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* NavBar placeholder */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center font-bold text-white text-sm">M</div>
            <span className="font-bold text-foreground">Mokkapp</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <Button size="sm">Get started</Button>
        </div>
      </nav>

      {/* Hero */}
      <Hero
        badge={<Badge variant="primary" size="sm">New — Contracts v0.1</Badge>}
        headline="Build faster. Ship better."
        subtext="The design system that ships with your product. Fewer decisions, more momentum."
        primaryCta={<Button size="lg">Get started</Button>}
        secondaryCta={<Button size="lg" variant="ghost">Learn more</Button>}
        variant="centered"
      />

      {/* Features */}
      <section id="features" className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-12">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-foreground">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              All the tools your team needs to build and ship faster.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} variant={f.variant} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-card py-20 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-12">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-foreground">Loved by teams everywhere</h2>
            <p className="text-muted-foreground text-lg">Don&apos;t just take our word for it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.authorName} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-12">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Pick the plan that works for your team.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 w-full max-w-3xl mx-auto">
            <PricingCard
              tier="Starter"
              price="Free"
              description="Everything you need to get started."
              features={['Up to 3 projects', '1 team member', 'Basic components', 'Community support']}
              cta={<Button variant="secondary" className="w-full">Get started free</Button>}
            />
            <PricingCard
              tier="Pro"
              price="$29"
              period="month"
              badge="Most popular"
              description="For teams that move fast."
              features={['Unlimited projects', 'Up to 10 members', 'All components', 'Priority support', 'Custom tokens']}
              cta={<Button className="w-full">Get started</Button>}
              highlighted
            />
            <PricingCard
              tier="Enterprise"
              price="$99"
              period="month"
              description="For large teams at scale."
              features={['Unlimited everything', 'SSO & audit logs', 'Dedicated support', 'Custom contract SLA']}
              cta={<Button variant="secondary" className="w-full">Contact us</Button>}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center font-bold text-white text-sm">M</div>
            <span className="font-bold text-foreground">Mokkapp</span>
          </div>
        }
        columns={NAV_COLUMNS}
        bottomText="© 2026 Mokkapp Studio. All rights reserved."
      />
    </div>
  );
}
