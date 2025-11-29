import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { 
  Bell, 
  Search, 
  Brain, 
  Mail, 
  CheckCircle, 
  Clock, 
  Target, 
  Shield,
  ArrowRight,
  Building2,
  FileText,
  Zap
} from "lucide-react";

const howItWorks = [
  {
    icon: Search,
    title: "Scrape",
    description: "We continuously monitor GeM, eProcure, and MahaTenders portals for new opportunities.",
  },
  {
    icon: Brain,
    title: "Classify",
    description: "AI categorizes each tender into your industry segment for precise matching.",
  },
  {
    icon: Target,
    title: "Match",
    description: "Tenders are matched to your registered categories and preferences.",
  },
  {
    icon: Mail,
    title: "Alert",
    description: "Receive daily email alerts with relevant tenders directly in your inbox.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description: "Stop manually searching across multiple portals. Get all relevant tenders in one place.",
  },
  {
    icon: Bell,
    title: "Never Miss a Tender",
    description: "Daily alerts ensure you're always informed about new opportunities in your category.",
  },
  {
    icon: Shield,
    title: "Smart Categories",
    description: "AI-powered classification ensures you only see tenders relevant to your business.",
  },
];

const portals = [
  {
    name: "GeM",
    fullName: "Government e-Marketplace",
    description: "India's largest public procurement platform",
    icon: Building2,
  },
  {
    name: "eProcure",
    fullName: "Central Government eProcurement",
    description: "CPP Portal for central government tenders",
    icon: FileText,
  },
  {
    name: "MahaTenders",
    fullName: "Maharashtra State Tenders",
    description: "State government procurement portal",
    icon: Zap,
  },
];

export default function Home() {
  return (
    <Layout>
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8">
              <Bell className="h-4 w-4" />
              <span>Smart Tender Alerts Platform</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Smart Tender Alerts for
              <span className="block text-primary mt-2">Indian Businesses</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Never miss a government tender opportunity again. We monitor GeM, eProcure, and MahaTenders 
              to deliver AI-categorized tender alerts directly to your inbox.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="hero-cta-primary">
                <Link href="/register">
                  Get Daily Alerts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="hero-cta-secondary">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>10+ Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>3 Portals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Daily Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How TenderLert Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our automated system ensures you receive relevant tender notifications without lifting a finger.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <Card key={step.title} className="relative hover-elevate" data-testid={`step-card-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-3 left-6 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 mt-2">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Supported Portals</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We aggregate tenders from India's major government procurement platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portals.map((portal) => (
              <Card key={portal.name} className="hover-elevate" data-testid={`portal-card-${portal.name.toLowerCase()}`}>
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6">
                    <portal.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{portal.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{portal.fullName}</p>
                  <p className="text-sm text-muted-foreground">{portal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose TenderLert?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of businesses that have streamlined their tender discovery process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="hover-elevate" data-testid={`benefit-card-${benefit.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-6">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Never Miss a Tender?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Start receiving daily tender alerts tailored to your business category. 
            Join TenderLert today and stay ahead of the competition.
          </p>
          <div className="mt-10">
            <Button size="lg" variant="secondary" asChild data-testid="final-cta">
              <Link href="/register">
                Start Receiving Alerts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
