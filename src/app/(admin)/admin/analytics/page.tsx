"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { adminApi } from "@/lib/api/admin";
import { formatCurrency } from "@/lib/utils";
import type { OverviewAnalytics } from "@/types";

// Types for analytics data
interface RevenueByDay {
  _id: string;
  revenue: number;
  count: number;
}

interface RevenueByCourse {
  courseId: string;
  title: string;
  revenue: number;
  transactions: number;
}

interface EnrollmentsByDay {
  _id: string;
  count: number;
}

interface TopCourse {
  courseId: string;
  title: string;
  enrollments: number;
}

interface EnrollmentsByStatus {
  _id: string;
  count: number;
}

interface RevenueData {
  revenueByDay: RevenueByDay[];
  revenueByCourse: RevenueByCourse[];
  revenueByProvider: { _id: string; revenue: number; count: number }[];
  totals: {
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionValue: number;
  };
}

interface EnrollmentData {
  enrollmentsByDay: EnrollmentsByDay[];
  enrollmentsByStatus: EnrollmentsByStatus[];
  topCourses: TopCourse[];
  completionRate: number;
}

// Color palette for pie chart
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#64748b", "#3b82f6", "#8b5cf6"];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");

  // Fetch overview analytics
  const { data: overviewResponse, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminApi.getOverview(),
  });

  // Fetch revenue analytics
  const { data: revenueResponse, isLoading: revenueLoading } = useQuery({
    queryKey: ["admin-revenue", dateRange],
    queryFn: () => adminApi.getRevenueAnalytics(),
  });

  // Fetch enrollment analytics  
  const { data: enrollmentResponse, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["admin-enrollments", dateRange],
    queryFn: () => adminApi.getEnrollmentAnalytics(),
  });

  const overview: OverviewAnalytics | undefined = overviewResponse?.data;
  const revenueData = revenueResponse?.data as RevenueData | undefined;
  const enrollmentData = enrollmentResponse?.data as EnrollmentData | undefined;

  // Transform data for charts
  const revenueChartData = revenueData?.revenueByDay?.map((item) => ({
    date: item._id,
    revenue: item.revenue,
  })) || [];

  const enrollmentChartData = enrollmentData?.enrollmentsByDay?.map((item) => ({
    date: item._id,
    enrollments: item.count,
  })) || [];

  const statusChartData = enrollmentData?.enrollmentsByStatus?.map((item) => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1) || 'Unknown',
    value: item.count,
  })) || [];

  const topCoursesChartData = enrollmentData?.topCourses?.map((item) => ({
    name: item.title?.length > 25 ? item.title.substring(0, 25) + '...' : item.title,
    enrollments: item.enrollments,
  })) || [];

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(overview?.revenue?.total || 0, "USD"),
      icon: DollarSign,
      color: "bg-green-600",
    },
    {
      title: "Total Enrollments",
      value: overview?.enrollments?.total?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-blue-600",
    },
    {
      title: "New Users",
      value: overview?.users?.newThisMonth?.toLocaleString() || "0",
      icon: Users,
      color: "bg-violet-600",
    },
    {
      title: "Completion Rate",
      value: `${enrollmentData?.completionRate || 0}%`,
      icon: BookOpen,
      color: "bg-amber-600",
    },
  ];

  const isLoading = overviewLoading || revenueLoading || enrollmentLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track metrics and platform growth
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] rounded-none border-border">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-none border-border">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-8">
        <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b border-border space-x-6">
          <TabsTrigger
            value="revenue"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-bold uppercase tracking-wide text-xs text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="enrollments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-bold uppercase tracking-wide text-xs text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Enrollments
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-bold uppercase tracking-wide text-xs text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Course Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-8 mt-0 pt-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 rounded-none border-border shadow-none">
              <CardHeader className="p-6 border-b border-border bg-muted/5">
                <CardTitle className="font-heading text-lg">Revenue Over Time</CardTitle>
                <CardDescription>
                  Daily revenue for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {revenueLoading ? (
                  <Skeleton className="h-[350px] w-full rounded-none" />
                ) : revenueChartData.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground border border-dashed border-border bg-muted/5">
                    No revenue data available
                  </div>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                          dataKey="date"
                          className="text-xs font-mono text-muted-foreground"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          className="text-xs font-mono text-muted-foreground"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                          tickMargin={10}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-popover border border-border shadow-none p-3 rounded-none">
                                  <p className="font-mono text-xs text-muted-foreground mb-1">{payload[0].payload.date}</p>
                                  <p className="font-bold text-foreground">
                                    {formatCurrency(payload[0].value as number, "USD")}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          activeDot={{ r: 4, strokeWidth: 0, className: "fill-primary" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enrollment Status Distribution */}
            <Card className="rounded-none border-border shadow-none">
              <CardHeader className="p-6 border-b border-border bg-muted/5">
                <CardTitle className="font-heading text-lg">Enrollment Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {enrollmentLoading ? (
                  <Skeleton className="h-[250px] w-full rounded-none" />
                ) : statusChartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground border border-dashed border-border bg-muted/5">
                    No data available
                  </div>
                ) : (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-popover border border-border shadow-none p-3 rounded-none">
                                    <p className="font-medium text-sm">{payload[0].name}</p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                      {payload[0].value} enrollments
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {statusChartData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-none"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-xs text-muted-foreground uppercase tracking-wide truncate">
                            {item.name} <span className="text-foreground font-mono ml-1">{item.value}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-none border-border shadow-none bg-muted/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-24 rounded-none" />
                ) : (
                  <div className="text-3xl font-light text-foreground">
                    {formatCurrency(revenueData?.totals?.totalRevenue || 0, "USD")}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-none border-border shadow-none bg-muted/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-24 rounded-none" />
                ) : (
                  <div className="text-3xl font-light text-foreground">
                    {revenueData?.totals?.totalTransactions || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-none border-border shadow-none bg-muted/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg. Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-24 rounded-none" />
                ) : (
                  <div className="text-3xl font-light text-foreground">
                    {formatCurrency(revenueData?.totals?.avgTransactionValue || 0, "USD")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-8 mt-0 pt-6">
          <Card className="rounded-none border-border shadow-none">
            <CardHeader className="p-6 border-b border-border bg-muted/5">
              <CardTitle className="font-heading text-lg">Enrollments Over Time</CardTitle>
              <CardDescription>Daily enrollment numbers</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {enrollmentLoading ? (
                <Skeleton className="h-[400px] w-full rounded-none" />
              ) : enrollmentChartData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground border border-dashed border-border bg-muted/5">
                  No enrollment data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="date"
                        className="text-xs font-mono text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <YAxis className="text-xs font-mono text-muted-foreground" tickLine={false} axisLine={false} tickMargin={10} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border shadow-none p-3 rounded-none">
                                <p className="font-mono text-xs text-muted-foreground mb-1">{payload[0].payload.date}</p>
                                <p className="font-bold text-foreground">
                                  {payload[0].value} enrollments
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-8 mt-0 pt-6">
          <Card className="rounded-none border-border shadow-none">
            <CardHeader className="p-6 border-b border-border bg-muted/5">
              <CardTitle className="font-heading text-lg">Top Performing Courses</CardTitle>
              <CardDescription>Courses ranked by enrollment</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {enrollmentLoading ? (
                <Skeleton className="h-[400px] w-full rounded-none" />
              ) : topCoursesChartData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground border border-dashed border-border bg-muted/5">
                  No course data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCoursesChartData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" className="text-xs font-mono text-muted-foreground" tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        className="text-xs font-medium text-foreground"
                        tickLine={false}
                        axisLine={false}
                        width={180}
                        tickMargin={10}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border shadow-none p-3 rounded-none">
                                <p className="font-medium text-sm mb-1">{payload[0].payload.name}</p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  {payload[0].payload.enrollments} enrollments
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Course */}
          {revenueData?.revenueByCourse && revenueData.revenueByCourse.length > 0 && (
            <Card className="rounded-none border-border shadow-none">
              <CardHeader className="p-6 border-b border-border bg-muted/5">
                <CardTitle className="font-heading text-lg">Revenue by Course</CardTitle>
                <CardDescription>Top courses by revenue generated</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {revenueData.revenueByCourse.map((course, index) => (
                    <div key={course.courseId} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted text-muted-foreground font-mono text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {course.transactions} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-sm">{formatCurrency(course.revenue, "USD")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
function StatCard({ title, value, icon: Icon, color, isLoading }: StatCardProps) {
  return (
    <Card className="rounded-none border-border bg-card shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-2 rounded-none" />
            ) : (
              <p className="text-3xl font-light mt-2 text-foreground">{value}</p>
            )}
          </div>
          <div className={`h-10 w-10 ${color.replace('bg-', 'text-')} bg-opacity-10 bg-transparent flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
