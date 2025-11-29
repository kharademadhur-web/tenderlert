import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signupSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Loader2 } from "lucide-react";
import { z } from "zod";

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "You can now log in with your credentials.",
      });
      navigate("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
        <div className="mx-auto max-w-md w-full px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Bell className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">TenderLert</span>
            </div>
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground mt-2">
              Sign up to start receiving tender alerts
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create your TenderLert account
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password (min 6 characters)" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-signup">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
