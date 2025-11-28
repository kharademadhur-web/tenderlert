import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { registerClientSchema, TENDER_CATEGORIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";

type RegisterFormValues = z.infer<typeof registerClientSchema>;

export default function Register() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      categoryInterested: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const response = await apiRequest("POST", "/api/clients/register", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Check your email for confirmation and next steps.",
      });
      navigate("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="hidden lg:block space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                  <Bell className="h-4 w-4" />
                  Start Your Free Trial
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Get Daily Tender Alerts
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Join hundreds of businesses receiving AI-categorized tender alerts. 
                  Never miss an opportunity again.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Personalized Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Receive tenders matching your specific business category
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">All Major Portals</p>
                    <p className="text-sm text-muted-foreground">
                      Coverage of GeM, eProcure, and MahaTenders
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">AI-Powered Classification</p>
                    <p className="text-sm text-muted-foreground">
                      Smart categorization for accurate matching
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">7-Day Free Trial</p>
                    <p className="text-sm text-muted-foreground">
                      Try TenderLert risk-free, no credit card required
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="lg:shadow-xl">
              <CardHeader className="text-center lg:text-left">
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                  Start receiving tender alerts tailored to your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@company.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+91 98765 43210" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} data-testid="input-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoryInterested"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category of Interest</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select your business category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TENDER_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category} data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-register">
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Start Receiving Alerts"
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <a href="/login" className="text-primary hover:underline">
                        Log in
                      </a>
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
