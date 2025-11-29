import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TENDER_CATEGORIES, PORTALS, insertTenderSchema, type Tender, type Client, type User } from "@shared/schema";
import { 
  Users, 
  FileText, 
  Plus, 
  RefreshCw, 
  Mail, 
  Loader2,
  Building2,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const manualTenderSchema = z.object({
  portalName: z.string().min(1, "Portal is required"),
  bidNumber: z.string().min(1, "Bid number is required"),
  title: z.string().min(1, "Title is required"),
  department: z.string().optional(),
  stateLocation: z.string().optional(),
  itemCategory: z.string().optional(),
  estimatedValue: z.string().optional(),
  bidEndDate: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
});

type ManualTenderForm = z.infer<typeof manualTenderSchema>;

export default function Admin() {
  const { user, isAuthenticated } = useAuthStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [addTenderOpen, setAddTenderOpen] = useState(false);

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/login");
    return null;
  }

  const { data: clients, isLoading: loadingClients } = useQuery<(Client & { user: User })[]>({
    queryKey: ["/api/admin/clients"],
  });

  const { data: tenders, isLoading: loadingTenders } = useQuery<Tender[]>({
    queryKey: ["/api/admin/tenders"],
  });

  const form = useForm<ManualTenderForm>({
    resolver: zodResolver(manualTenderSchema),
    defaultValues: {
      portalName: "",
      bidNumber: "",
      title: "",
      department: "",
      stateLocation: "",
      itemCategory: "",
      estimatedValue: "",
      bidEndDate: "",
      sourceUrl: "",
    },
  });

  const addTenderMutation = useMutation({
    mutationFn: async (data: ManualTenderForm) => {
      const response = await apiRequest("POST", "/api/tenders/manual", data);
      return response;
    },
    onSuccess: () => {
      toast({ title: "Tender added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tenders"] });
      setAddTenderOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add tender",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rerunCategorizationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/rerun-today", {});
      return response;
    },
    onSuccess: () => {
      toast({ title: "Categorization re-run initiated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tenders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to re-run categorization",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/send-alerts", {});
      return response;
    },
    onSuccess: () => {
      toast({ title: "Email alerts triggered successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send alerts",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitTender = (data: ManualTenderForm) => {
    addTenderMutation.mutate(data);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage clients, tenders, and system operations
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => rerunCategorizationMutation.mutate()}
                disabled={rerunCategorizationMutation.isPending}
                data-testid="button-rerun-categorization"
              >
                {rerunCategorizationMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Re-run Categorization
              </Button>
              <Button
                variant="outline"
                onClick={() => sendAlertsMutation.mutate()}
                disabled={sendAlertsMutation.isPending}
                data-testid="button-send-alerts"
              >
                {sendAlertsMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Alerts Now
              </Button>
              <Dialog open={addTenderOpen} onOpenChange={setAddTenderOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-tender">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tender
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Manual Tender</DialogTitle>
                    <DialogDescription>
                      Add a new tender entry manually. AI will categorize it automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitTender)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="portalName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Portal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="input-portal">
                                    <SelectValue placeholder="Select portal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PORTALS.map((portal) => (
                                    <SelectItem key={portal} value={portal}>{portal}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bidNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bid Number</FormLabel>
                              <FormControl>
                                <Input placeholder="GEM/2024/..." {...field} data-testid="input-bid-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tender title/description" {...field} data-testid="input-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input placeholder="Ministry/Department" {...field} data-testid="input-department" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="stateLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Maharashtra, Delhi..." {...field} data-testid="input-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="estimatedValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Value (INR)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="1000000" {...field} data-testid="input-value" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bidEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bid End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-end-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="sourceUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source URL</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://gem.gov.in/..." {...field} data-testid="input-source-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAddTenderOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addTenderMutation.isPending} data-testid="button-submit-tender">
                          {addTenderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Tender
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-clients">{clients?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Registered Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-tenders">{tenders?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Tenders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-portals">{PORTALS.length}</p>
                    <p className="text-sm text-muted-foreground">Active Portals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList>
              <TabsTrigger value="clients" data-testid="tab-clients">
                <Users className="h-4 w-4 mr-2" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="tenders" data-testid="tab-tenders">
                <FileText className="h-4 w-4 mr-2" />
                Tenders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Registered Clients</CardTitle>
                  <CardDescription>
                    All clients registered for tender alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingClients ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : clients && clients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Registered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow key={client.id} data-testid={`client-row-${client.id}`}>
                              <TableCell className="font-medium">{client.user?.name || "N/A"}</TableCell>
                              <TableCell>{client.user?.email || "N/A"}</TableCell>
                              <TableCell>{client.companyName}</TableCell>
                              <TableCell>{client.phone}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{client.categoryInterested}</Badge>
                              </TableCell>
                              <TableCell>
                                {client.createdAt && format(new Date(client.createdAt), "dd MMM yyyy")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No clients yet</h3>
                      <p className="text-muted-foreground">
                        Clients will appear here once they register for alerts.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tenders">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>All Tenders</CardTitle>
                  <CardDescription>
                    Complete list of tenders in the database
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingTenders ? (
                    <div className="p-6 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : tenders && tenders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Portal</TableHead>
                            <TableHead>Bid ID</TableHead>
                            <TableHead className="min-w-[250px]">Title</TableHead>
                            <TableHead>AI Category</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tenders.map((tender) => (
                            <TableRow key={tender.id} data-testid={`admin-tender-row-${tender.id}`}>
                              <TableCell>
                                <Badge variant="outline">{tender.portalName}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{tender.bidNumber}</TableCell>
                              <TableCell className="line-clamp-2">{tender.title}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{tender.aiCategory || "Pending"}</Badge>
                              </TableCell>
                              <TableCell>
                                {tender.bidEndDate ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(tender.bidEndDate), "dd MMM yyyy")}
                                  </div>
                                ) : "N/A"}
                              </TableCell>
                              <TableCell>
                                {tender.estimatedValue ? 
                                  new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  }).format(parseFloat(tender.estimatedValue))
                                  : "N/A"
                                }
                              </TableCell>
                              <TableCell className="text-right">
                                {tender.sourceUrl && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={tender.sourceUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No tenders yet</h3>
                      <p className="text-muted-foreground">
                        Add tenders manually or wait for automated import.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
