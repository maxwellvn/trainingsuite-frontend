"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
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
import { formatCurrency } from "@/lib/utils";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 12400, enrollments: 234 },
  { month: "Feb", revenue: 15600, enrollments: 287 },
  { month: "Mar", revenue: 18200, enrollments: 312 },
  { month: "Apr", revenue: 16800, enrollments: 298 },
  { month: "May", revenue: 21400, enrollments: 378 },
  { month: "Jun", revenue: 24800, enrollments: 412 },
  { month: "Jul", revenue: 22100, enrollments: 387 },
  { month: "Aug", revenue: 26500, enrollments: 445 },
  { month: "Sep", revenue: 28900, enrollments: 478 },
  { month: "Oct", revenue: 32100, enrollments: 523 },
  { month: "Nov", revenue: 35600, enrollments: 567 },
  { month: "Dec", revenue: 38400, enrollments: 612 },
];

const userGrowthData = [
  { month: "Jan", newUsers: 156, activeUsers: 1240 },
  { month: "Feb", newUsers: 189, activeUsers: 1420 },
  { month: "Mar", newUsers: 234, activeUsers: 1650 },
  { month: "Apr", newUsers: 278, activeUsers: 1890 },
  { month: "May", newUsers: 312, activeUsers: 2180 },
  { month: "Jun", newUsers: 356, activeUsers: 2520 },
];

const coursePerformanceData = [
  { name: "React Masterclass", enrollments: 1234, revenue: 12340, completion: 78 },
  { name: "Node.js Advanced", enrollments: 987, revenue: 9870, completion: 72 },
  { name: "Python Basics", enrollments: 856, revenue: 8560, completion: 85 },
  { name: "AWS Fundamentals", enrollments: 743, revenue: 7430, completion: 68 },
  { name: "TypeScript Deep Dive", enrollments: 621, revenue: 6210, completion: 74 },
];

const categoryDistribution = [
  { name: "Programming", value: 45, color: "#6366f1" },
  { name: "Design", value: 20, color: "#f59e0b" },
  { name: "Business", value: 15, color: "#10b981" },
  { name: "Marketing", value: 12, color: "#ec4899" },
  { name: "Other", value: 8, color: "#64748b" },
];

const stats = [
  {
    title: "Total Revenue",
    value: "$293,800",
    change: "+23.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    title: "Total Enrollments",
    value: "4,923",
    change: "+18.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "bg-blue-500",
  },
  {
    title: "Active Users",
    value: "2,520",
    change: "+12.8%",
    changeType: "positive" as const,
    icon: Users,
    color: "bg-violet-500",
  },
  {
    title: "Completion Rate",
    value: "76.4%",
    change: "-2.1%",
    changeType: "negative" as const,
    icon: BookOpen,
    color: "bg-amber-500",
  },
];

function StatCard({ stat }: { stat: (typeof stats)[0] }) {
  const Icon = stat.icon;
  const isPositive = stat.changeType === "positive";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div
            className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("12months");

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
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
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
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue & Enrollments</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue and enrollment trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
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
                                <p className="font-medium">{payload[0].payload.month}</p>
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
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Courses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg shadow-lg p-3">
                                <p className="font-medium">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {payload[0].value}% of courses
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
                  {categoryDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollments Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollments Trend</CardTitle>
              <CardDescription>Monthly enrollment numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
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
                              <p className="font-medium">{payload[0].payload.month}</p>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New and active users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
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
                              <p className="font-medium">{payload[0].payload.month}</p>
                              <p className="text-sm text-blue-600">
                                New Users: {payload[0].value}
                              </p>
                              <p className="text-sm text-green-600">
                                Active Users: {payload[1].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="New Users"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Active Users"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses ranked by enrollment and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformanceData} layout="vertical">
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
                              <p className="text-sm text-muted-foreground">
                                Revenue: {formatCurrency(payload[0].payload.revenue, "USD")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Completion: {payload[0].payload.completion}%
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
