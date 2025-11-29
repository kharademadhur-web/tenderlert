import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "499",
    description: "Perfect for individual contractors and small businesses",
    features: [
      "1 Category",
      "Daily email alerts",
      "GeM portal coverage",
      "Basic tender details",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Business",
    price: "999",
    description: "Ideal for growing businesses with multiple interests",
    features: [
      "Up to 3 Categories",
      "Daily email alerts",
      "All portal coverage",
      "Complete tender details",
      "Priority email support",
      "Category preferences update",
      "Tender history access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "2,499",
    description: "For large organizations with diverse requirements",
    features: [
      "Unlimited Categories",
      "Real-time email alerts",
      "All portal coverage",
      "Complete tender details",
      "Priority phone & email support",
      "Custom category mapping",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <Layout>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs. All plans include our core tender alert features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : 'hover-elevate'}`}
                data-testid={`pricing-card-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                    data-testid={`button-select-${plan.name.toLowerCase()}`}
                  >
                    <Link href="/register">Start Free Trial</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              All plans include a 7-day free trial. No credit card required.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Have questions?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact our sales team
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What categories are supported?</h3>
                <p className="text-muted-foreground text-sm">
                  We support 10 major categories including IT/Software, Construction/Civil, Medical/Healthcare, 
                  Security/Defence, and more. Our AI continuously improves category accuracy.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How often are tenders updated?</h3>
                <p className="text-muted-foreground text-sm">
                  Our system monitors portals multiple times daily. You receive consolidated daily alerts 
                  with all new tenders matching your categories.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
                <p className="text-muted-foreground text-sm">
                  We offer a 7-day money-back guarantee. If you're not satisfied within the first week, 
                  we'll refund your payment in full.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
