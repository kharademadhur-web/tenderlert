import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth";
import { TENDER_CATEGORIES, PORTALS, type Tender } from "@shared/schema";
import { 
  FileText, 
  Filter, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Search,
  Bell,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [, navigate] = useLocation();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [portalFilter, setPortalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const { data: tenders, isLoading } = useQuery<Tender[]>({
    queryKey: ["/api/tenders/today"],
  });

  const { data: clientProfile } = useQuery({
    queryKey: ["/api/clients/me"],
    enabled: isAuthenticated,
  });

  const filteredTenders = tenders?.filter((tender) => {
    const matchesCategory = categoryFilter === "all" || tender.aiCategory === categoryFilter;
    const matchesPortal = portalFilter === "all" || tender.portalName === portalFilter;
    const matchesSearch = !searchQuery || 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPortal && matchesSearch;
  });

  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getUrgencyBadge = (endDate: Date | null) => {
    if (!endDate) return null;
    const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    if (daysLeft <= 5) return <Badge className="bg-amber-500 text-xs">Closing Soon</Badge>;
    return null;
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}! Here are today's tender opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-tenders">{tenders?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Tenders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-matching">{filteredTenders?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Matching Filters</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-closing-soon">
                      {tenders?.filter((t) => {
                        if (!t.bidEndDate) return false;
                        const daysLeft = Math.ceil((new Date(t.bidEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return daysLeft <= 5;
                      }).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Closing Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-portals">{PORTALS.length}</p>
                    <p className="text-sm text-muted-foreground">Active Portals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Tenders
                  </CardTitle>
                  <CardDescription>Narrow down tenders by category, portal, or search</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {TENDER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={portalFilter} onValueChange={setPortalFilter}>
                  <SelectTrigger data-testid="filter-portal">
                    <SelectValue placeholder="All Portals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Portals</SelectItem>
                    {PORTALS.map((portal) => (
                      <SelectItem key={portal} value={portal}>{portal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Today's Tenders
              </CardTitle>
              <CardDescription>
                Showing {filteredTenders?.length || 0} tenders matching your criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTenders && filteredTenders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Portal</TableHead>
                        <TableHead>Bid ID</TableHead>
                        <TableHead className="min-w-[300px]">Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Bid End Date</TableHead>
                        <TableHead>Est. Value</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenders.map((tender) => (
                        <TableRow key={tender.id} className="hover-elevate" data-testid={`tender-row-${tender.id}`}>
                          <TableCell>
                            <Badge variant="outline">{tender.portalName}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{tender.bidNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <span className="line-clamp-2">{tender.title}</span>
                              {getUrgencyBadge(tender.bidEndDate)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {tender.department || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {tender.aiCategory || "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {tender.bidEndDate ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(tender.bidEndDate), "dd MMM yyyy")}
                              </div>
                            ) : "N/A"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(tender.estimatedValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {tender.sourceUrl && (
                              <Button size="sm" variant="outline" asChild data-testid={`button-view-tender-${tender.id}`}>
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
                  <h3 className="text-lg font-medium mb-2">No tenders found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || categoryFilter !== "all" || portalFilter !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "Check back later for new tender opportunities."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium" data-testid="profile-name">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="profile-email">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category Interest</p>
                  <Badge data-testid="profile-category">{(clientProfile as any)?.categoryInterested || "Not set"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
