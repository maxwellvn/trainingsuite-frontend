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

function StatCard({ title, value, icon: Icon, color, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
      color: "bg-green-500",
    },
    {
      title: "Total Enrollments",
      value: overview?.enrollments?.total?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      title: "New Users",
      value: overview?.users?.newThisMonth?.toLocaleString() || "0",
      icon: Users,
      color: "bg-violet-500",
    },
    {
      title: "Completion Rate",
      value: `${enrollmentData?.completionRate || 0}%`,
      icon: BookOpen,
      color: "bg-amber-500",
    },
  ];

  const isLoading = overviewLoading || revenueLoading || enrollmentLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your platform performance and growth
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>
                  Daily revenue for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : revenueChartData.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    No revenue data available
                  </div>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          className="text-xs"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border rounded-lg shadow-lg p-3">
                                  <p className="font-medium">{payload[0].payload.date}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Revenue:{" "}
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(payload[0].value as number, "USD")}
                                    </span>
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
                          stroke="#6366f1"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enrollment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : statusChartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
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
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-background border rounded-lg shadow-lg p-3">
                                    <p className="font-medium">{payload[0].name}</p>
                                    <p className="text-sm text-muted-foreground">
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
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {statusChartData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.name} ({item.value})
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatCurrency(revenueData?.totals?.totalRevenue || 0, "USD")}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {revenueData?.totals?.totalTransactions || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatCurrency(revenueData?.totals?.avgTransactionValue || 0, "USD")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollments Over Time</CardTitle>
              <CardDescription>Daily enrollment numbers</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : enrollmentChartData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No enrollment data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg shadow-lg p-3">
                                <p className="font-medium">{payload[0].payload.date}</p>
                                <p className="text-sm text-muted-foreground">
                                  Enrollments:{" "}
                                  <span className="font-medium text-foreground">
                                    {payload[0].value}
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="enrollments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses ranked by enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : topCoursesChartData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No course data available
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCoursesChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        className="text-xs"
                        tickLine={false}
                        axisLine={false}
                        width={150}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg shadow-lg p-3">
                                <p className="font-medium">{payload[0].payload.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Enrollments: {payload[0].payload.enrollments}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="enrollments" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Course */}
          {revenueData?.revenueByCourse && revenueData.revenueByCourse.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Course</CardTitle>
                <CardDescription>Top courses by revenue generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.revenueByCourse.map((course, index) => (
                    <div key={course.courseId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.transactions} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(course.revenue, "USD")}</p>
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
